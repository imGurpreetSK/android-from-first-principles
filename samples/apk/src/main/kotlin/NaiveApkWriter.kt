import java.io.ByteArrayOutputStream
import java.util.zip.CRC32

// region write
// Writes an APK: a ZIP file whose entries are stored (not compressed).
object NaiveApkWriter {
    fun write(entries: Map<String, ByteArray>): ByteArray {
        val apk = ByteArrayOutputStream()
        val centralDirectory = ByteArrayOutputStream()
        for ((name, data) in entries) {
            val nameBytes = name.toByteArray()
            val crc = CRC32().apply { update(data) }.value.toInt()
            centralDirectory.centralDirectoryRecord(nameBytes, data.size, crc, localHeaderOffset = apk.size())
            apk.localFileHeader(nameBytes, data.size, crc)
            apk.write(data) // The data starts right after the header. Nothing aligns it.
        }
        val centralDirectoryOffset = apk.size()
        centralDirectory.writeTo(apk)
        apk.endOfCentralDirectory(entries.size, centralDirectory.size(), centralDirectoryOffset)
        return apk.toByteArray()
    }
}
// endregion

// region header
// The field order of each record is from libziparchive, zip_archive_common.h.
private fun ByteArrayOutputStream.localFileHeader(name: ByteArray, size: Int, crc: Int) {
    u32(0x04034b50) // signature
    entryFields(name, size, crc)
    write(name)
}

// The local file header and the central directory record both have these fields.
private fun ByteArrayOutputStream.entryFields(name: ByteArray, size: Int, crc: Int) {
    u16(0) // version needed
    u16(0) // flags
    u16(0) // compression method: 0 is stored
    u16(0) // time: fixed, so that each run writes the same bytes
    u16(0) // date: fixed for the same reason
    u32(crc)
    u32(size) // compressed size
    u32(size) // uncompressed size
    u16(name.size)
    u16(0) // extra field length
}
// endregion

private fun ByteArrayOutputStream.centralDirectoryRecord(name: ByteArray, size: Int, crc: Int, localHeaderOffset: Int) {
    u32(0x02014b50) // signature
    u16(0) // version made by
    entryFields(name, size, crc)
    u16(0) // comment length
    u16(0) // start disk
    u16(0) // internal attributes
    u32(0) // external attributes
    u32(localHeaderOffset)
    write(name)
}

private fun ByteArrayOutputStream.endOfCentralDirectory(records: Int, size: Int, offset: Int) {
    u32(0x06054b50) // signature
    u16(0) // disk number
    u16(0) // start disk of the central directory
    u16(records) // records on this disk
    u16(records) // all records
    u32(size)
    u32(offset)
    u16(0) // comment length
}

// ZIP fields are little-endian. write(Int) writes only the low 8 bits.
private fun ByteArrayOutputStream.u16(value: Int) {
    write(value)
    write(value ushr 8)
}

private fun ByteArrayOutputStream.u32(value: Int) {
    u16(value)
    u16(value ushr 16)
}
