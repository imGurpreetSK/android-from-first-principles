pluginManagement {
    includeBuild("build-logic")
    repositories {
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode = RepositoriesMode.FAIL_ON_PROJECT_REPOS
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "samples"

include(":launch-app")
include(":apk")
include(":zygote")
include(":binder")
include(":components-lifecycle")
include(":main-thread")
include(":first-frame")
include(":config-changes")
include(":process-death")
