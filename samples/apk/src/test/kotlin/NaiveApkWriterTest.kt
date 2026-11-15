import java.io.File
import java.util.zip.CRC32
import java.util.zip.ZipEntry
import java.util.zip.ZipFile
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir

class NaiveApkWriterTest {
    @TempDir
    lateinit var dir: File

    @Test
    fun write_makesZipThatJdkZipFileReads() {
        val file = dir.resolve("app.apk")
        file.writeBytes(NaiveApkWriter.write(placeholderEntries))
        ZipFile(file).use { zip ->
            assertEquals(placeholderEntries.keys.toList(), zip.entries().toList().map { it.name })
            for ((name, data) in placeholderEntries) {
                val entry = zip.getEntry(name)
                assertEquals(ZipEntry.STORED, entry.method)
                assertEquals(CRC32().apply { update(data) }.value, entry.crc)
                assertArrayEquals(data, zip.getInputStream(entry).readBytes())
            }
        }
    }

    // region flaw
    @Test
    fun naiveApkWriter_putsStoredDexAtUnalignedOffset() {
        val apk = NaiveApkWriter.write(mapOf("classes.dex" to "dex".toByteArray()))
        // 30 bytes of fixed fields + 11 bytes of name: the data starts at 41.
        assertNotEquals(0, dataOffset(apk, "classes.dex") % 4)
    }
    // endregion
}

// The writer does not parse the bytes, so placeholders are enough.
val placeholderEntries = mapOf(
    "AndroidManifest.xml" to "manifest".toByteArray(),
    "classes.dex" to "dex".toByteArray(),
    "resources.arsc" to "table".toByteArray(),
)
