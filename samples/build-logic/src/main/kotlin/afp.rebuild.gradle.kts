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
