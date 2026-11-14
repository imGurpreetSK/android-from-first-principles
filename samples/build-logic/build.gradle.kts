plugins {
    `kotlin-dsl`
}

dependencies {
    implementation(libs.kotlin.gradle.plugin)
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.test {
    useJUnitPlatform()
    // The test projects use the version catalog of samples/.
    val catalog = file("../gradle/libs.versions.toml")
    inputs.file(catalog)
    systemProperty("afp.catalog", catalog.invariantSeparatorsPath)
}
