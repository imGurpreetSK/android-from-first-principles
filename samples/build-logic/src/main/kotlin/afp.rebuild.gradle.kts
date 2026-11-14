import java.util.zip.ZipFile
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// A rebuild module is a plain Kotlin/JVM module. JUnit runs its tests.
plugins {
    id("org.jetbrains.kotlin.jvm")
}

val libs = extensions.getByType<VersionCatalogsExtension>().named("libs")

dependencies {
    testImplementation(platform(libs.findLibrary("junit-bom").get()))
    testImplementation(libs.findLibrary("junit-jupiter").get())
    testRuntimeOnly(libs.findLibrary("junit-platform-launcher").get())
}

// Rebuild modules use JDK 17 bytecode and JDK 17 API, on all JDKs.
kotlin.compilerOptions {
    jvmTarget = JvmTarget.JVM_17
    freeCompilerArgs.add("-Xjdk-release=17")
}

tasks.withType<JavaCompile>().configureEach {
    options.release = 17
}

tasks.test {
    useJUnitPlatform()
}

// A rebuild module is a plain Kotlin/JVM module. This task fails the build if a classpath has Android classes or Robolectric.
val checkNoAndroid = tasks.register("checkNoAndroid") {
    val jars = files(configurations.compileClasspath, configurations.testCompileClasspath, configurations.testRuntimeClasspath)
        .filter { it.name.endsWith(".jar") }
    inputs.files(jars)
    doLast {
        val androidJars = jars.filter { jar ->
            ZipFile(jar).use { zip ->
                zip.entries().asSequence().any { it.name.startsWith("android/") || it.name.startsWith("org/robolectric/") }
            }
        }
        if (!androidJars.isEmpty) {
            throw GradleException(
                "Rebuild modules must not use Android classes or Robolectric: " + androidJars.joinToString { it.name }
            )
        }
    }
}

tasks.check {
    dependsOn(checkNoAndroid)
}
