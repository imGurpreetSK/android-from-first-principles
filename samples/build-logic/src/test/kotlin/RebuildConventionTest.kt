import java.io.File
import java.util.zip.ZipFile
import org.gradle.testkit.runner.GradleRunner
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir

class RebuildConventionTest {
    @TempDir
    lateinit var projectDir: File

    @BeforeEach
    fun writeRebuildModule() {
        val catalog = System.getProperty("afp.catalog")
        projectDir.resolve("settings.gradle.kts").writeText(
            """
            dependencyResolutionManagement {
                repositories { mavenCentral() }
                versionCatalogs { create("libs") { from(files("$catalog")) } }
            }
            """.trimIndent()
        )
        projectDir.resolve("build.gradle.kts").writeText(
            """
            plugins { id("afp.rebuild") }

            tasks.register("printCompileClasspath") {
                val classpath = configurations.compileClasspath.get().incoming.files
                doLast { classpath.forEach { println("classpath: " + it) } }
            }
            """.trimIndent()
        )
    }

    @Test
    fun compileClasspath_hasNoAndroidClasses() {
        val output = runGradle("printCompileClasspath")
        val jars = output.lines()
            .filter { it.startsWith("classpath: ") }
            .map { File(it.removePrefix("classpath: ")) }
        // If the classpath has no Kotlin stdlib, the check below reads the wrong output.
        assertTrue(jars.any { it.name.startsWith("kotlin-stdlib") }, output)
        val androidClasses = jars.flatMap { jar ->
            ZipFile(jar).use { zip ->
                zip.entries().asSequence().map { it.name }.filter { it.startsWith("android/") }.toList()
            }
        }
        assertEquals(emptyList<String>(), androidClasses)
    }

    @Test
    fun testTask_runsJUnitTests() {
        projectDir.resolve("src/test/kotlin").mkdirs()
        projectDir.resolve("src/test/kotlin/SmokeTest.kt").writeText(
            """
            import org.junit.jupiter.api.Test

            class SmokeTest {
                @Test
                fun runs() {}
            }
            """.trimIndent()
        )
        runGradle("test")
        assertTrue(projectDir.resolve("build/test-results/test/TEST-SmokeTest.xml").isFile)
    }

    private fun runGradle(task: String): String =
        GradleRunner.create()
            .withProjectDir(projectDir)
            .withPluginClasspath()
            .withArguments(task)
            .build()
            .output
}
