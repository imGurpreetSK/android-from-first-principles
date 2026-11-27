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

    // Device prompts run the release build, so the cold start has no JDWP or CheckJNI. The debug key lets the reader install it.
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    // launchPath is the app of all Section 1 chapters. Each other flavor is the app of one chapter.
    flavorDimensions += "chapter"
    productFlavors {
        // After Section 1 ships, do not change src/main, defaultConfig, the release build type or this flavor. All of them build the Section 1 app.
        create("launchPath") {
            dimension = "chapter"
            isDefault = true
            // The captured Section 1 output depends on targetSdk. Do not change it.
            targetSdk = 37
        }
        // The app of the config-changes chapter. Its device prompts run this flavor.
        create("configChanges") {
            dimension = "chapter"
            // A separate application ID, so that this app installs next to launchPath.
            applicationIdSuffix = ".configChanges"
            // The baseline of the chapter is Android 17 (API level 37).
            targetSdk = 37
        }
        // The app of the process-death chapter. Its device prompts run installProcessDeathRelease.
        create("processDeath") {
            dimension = "chapter"
            // The suffix lets the flavor install next to launchPath.
            applicationIdSuffix = ".processDeath"
            // The API level of the Android 17 baseline of the chapter.
            targetSdk = 37
        }
        // The app of the dependency-injection chapter. Its manifest replaces the AppComponentFactory of the app.
        create("dependencyInjection") {
            dimension = "chapter"
            applicationIdSuffix = ".dependencyInjection"
            // The baseline of the chapter is Android 17 (API level 37).
            targetSdk = 37
        }
        // The app of the coroutines chapter. Its device prompts run installCoroutinesRelease.
        create("coroutines") {
            dimension = "chapter"
            applicationIdSuffix = ".coroutines"
            // The API level of the Android 17 baseline of the chapter.
            targetSdk = 37
        }
    }
}

dependencies {
    // The versions of the checked stamp of the config-changes chapter.
    "configChangesImplementation"("androidx.activity:activity:1.13.0")
    "configChangesImplementation"("androidx.lifecycle:lifecycle-viewmodel:2.11.0")
    // The versions of the checked stamp of the coroutines chapter. kotlinx-coroutines 1.11.0 asks for kotlin-stdlib 2.2.20, so the second line sets 2.4.21.
    "coroutinesImplementation"("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.11.0")
    "coroutinesImplementation"("org.jetbrains.kotlin:kotlin-stdlib:2.4.21")
}
