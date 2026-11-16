import java.io.ByteArrayOutputStream
import java.util.zip.CRC32
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class DataOffsetTest {
    @Test
    fun dataOffset_pointsAtTheDataOfEachEntry() {
        val apk = NaiveApkWriter.write(placeholderEntries)
        for ((name, data) in placeholderEntries) {
            val offset = dataOffset(apk, name)
            assertArrayEquals(data, apk.copyOfRange(offset, offset + data.size))
        }
    }

    // NaiveApkWriter writes no extra field, so the JDK writes this ZIP file.
    @Test
    fun dataOffset_skipsTheExtraField() {
        val data = "dex".toByteArray()
        val zip = ByteArrayOutputStream()
        ZipOutputStream(zip).use {
            it.putNextEntry(ZipEntry("classes.dex").apply {
                method = ZipEntry.STORED
                size = data.size.toLong()
                crc = CRC32().apply { update(data) }.value
                extra = byteArrayOf(0x34, 0x12, 1, 0, 0) // one field: ID 0x1234, 1 byte of data
            })
            it.write(data)
        }
        val bytes = zip.toByteArray()
        val offset = dataOffset(bytes, "classes.dex")
        assertArrayEquals(data, bytes.copyOfRange(offset, offset + data.size))
    }

    @Test
    fun dataOffset_throwsForMissingEntry() {
        assertThrows<NoSuchElementException> { dataOffset(NaiveApkWriter.write(placeholderEntries), "classes2.dex") }
    }
}
