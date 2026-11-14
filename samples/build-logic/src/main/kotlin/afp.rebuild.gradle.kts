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

tasks.test {
    useJUnitPlatform()
}
