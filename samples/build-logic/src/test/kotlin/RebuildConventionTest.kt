import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import org.gradle.testkit.runner.GradleRunner
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir

class RebuildConventionTest {
    @TempDir
    lateinit var projectDir: File

    @BeforeEach
    fun writeRebuildModule() {
        // Gradle imports gradle/libs.versions.toml as the libs catalog.
        projectDir.resolve("gradle").mkdirs()
        projectDir.resolve("gradle/libs.versions.toml").writeText(javaClass.getResource("/libs.versions.toml")!!.readText())
        projectDir.resolve("settings.gradle.kts").writeText(
            """
            dependencyResolutionManagement {
                repositories { mavenCentral() }
            }
            """.trimIndent()
        )
        projectDir.resolve("build.gradle.kts").writeText(
            """
            plugins { id("afp.rebuild") }
            """.trimIndent()
        )
    }

    @Test
    fun check_runsJUnitTests() {
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
        gradle("check").build()
        assertTrue(projectDir.resolve("build/test-results/test/TEST-SmokeTest.xml").isFile)
    }

    @Test
    fun check_failsOnAndroidClassesInTestClasspath() {
        ZipOutputStream(projectDir.resolve("android.jar").outputStream()).use {
            it.putNextEntry(ZipEntry("android/os/Bundle.class"))
        }
        projectDir.resolve("build.gradle.kts").appendText(
            "\ndependencies { testImplementation(files(\"android.jar\")) }\n"
        )
        val output = gradle("check").buildAndFail().output
        assertTrue(
            output.contains("Rebuild modules must not use Android classes or Robolectric: android.jar"),
            output,
        )
    }

    @Test
    fun compileKotlin_rejectsJdk21Api() {
        projectDir.resolve("src/main/kotlin").mkdirs()
        projectDir.resolve("src/main/kotlin/Virtual.kt").writeText(
            "fun virtualThread() = Thread.ofVirtual()"
        )
        val output = gradle("compileKotlin").buildAndFail().output
        assertTrue(output.contains("Unresolved reference 'ofVirtual'"), output)
    }

    // The configuration cache makes the build fail if a task is not compatible with it.
    private fun gradle(task: String): GradleRunner =
        GradleRunner.create()
            .withProjectDir(projectDir)
            .withPluginClasspath()
            .withArguments(task, "--configuration-cache")
}
