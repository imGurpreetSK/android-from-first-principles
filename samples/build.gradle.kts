plugins {
    base
    // Load AGP and the Kotlin plugin one time, here, so that all modules use the same versions.
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.jvm) apply false
}
