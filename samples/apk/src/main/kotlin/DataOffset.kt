import java.nio.ByteBuffer
import java.nio.ByteOrder

// region offset
// Returns the offset in zip where the data of the entry name starts.
// This reader reads the local file headers in turn, from the start of the file.
// The platform ZIP reader finds each header through the central directory, but it uses the same formula
// (libziparchive, zip_archive.cc).
fun dataOffset(zip: ByteArray, name: String): Int {
    val bytes = ByteBuffer.wrap(zip).order(ByteOrder.LITTLE_ENDIAN)
    var header = 0
    while (bytes.getInt(header) == 0x04034b50) { // local file header signature
        val nameLength = bytes.u16(header + 26)
        val extraLength = bytes.u16(header + 28)
        val data = header + 30 + nameLength + extraLength // 30 bytes of fixed fields
        if (String(zip, header + 30, nameLength) == name) return data
        header = data + bytes.getInt(header + 18) // + compressed size
    }
    throw NoSuchElementException(name)
}
// endregion

private fun ByteBuffer.u16(index: Int) = getShort(index).toInt() and 0xffff
