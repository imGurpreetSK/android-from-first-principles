plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "io.github.imgurpreetsk.afp.launchapp"
    compileSdk = libs.versions.compileSdk.get().toInt()
    // By default, AGP 9 adds the Kotlin compile task and the Kotlin standard library. The app is in Java, so this setting removes them. Thus the app has no dependencies.
    enableKotlin = false

    defaultConfig {
        applicationId = "io.github.imgurpreetsk.afp.launchapp"
        // Chapters show the differences back to Android 10 (API level 29).
        minSdk = 29
    }

    // launchPath is the app of all Section 1 chapters. Each other flavor is the app of one chapter.
    flavorDimensions += "chapter"
    productFlavors {
        create("launchPath") {
            dimension = "chapter"
            isDefault = true
            // The captured Section 1 output depends on targetSdk. Do not change it.
            targetSdk = 37
        }
    }
}
