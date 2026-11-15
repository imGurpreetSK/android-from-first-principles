---
title: "Config changes & ViewModel"
section: State & Survival
sidebar:
  order: 1
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { androidx.activity: "1.13.0", androidx.lifecycle: "2.11.0" }
  emulator: { image: "system-images;android-37.0;google_apis;arm64-v8a", revision: 8 }
sources:
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/wm/ActivityRecord.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/window/SizeConfigurationBuckets.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/app/ActivityThread.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/app/Activity.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/content/res/Configuration.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/content/pm/ActivityInfo.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/com/android/internal/pm/pkg/component/ParsedActivityUtils.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/wm/AppCompatRecreateOnConfigChangePolicy.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/wm/ActivityClientController.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/UiModeManagerService.java
  - https://developer.android.com/guide/topics/resources/runtime-changes
  - https://developer.android.com/topic/libraries/architecture/viewmodel
  - https://developer.android.com/develop/ui/compose/state
  - https://developer.android.com/about/versions/12/behavior-changes-all
  - https://developer.android.com/about/versions/16/behavior-changes-16
  - https://developer.android.com/about/versions/17/behavior-changes-17
  - https://developer.android.com/about/versions/17/behavior-changes-all
  - https://android.googlesource.com/platform/frameworks/support/+/475afe04599ffc0893939effda40187916c4ceb0/activity/activity/src/main/java/androidx/activity/ComponentActivity.kt
  - https://android.googlesource.com/platform/frameworks/support/+/475afe04599ffc0893939effda40187916c4ceb0/activity/activity-compose/src/main/java/androidx/activity/compose/ComponentActivity.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-runtime/src/androidMain/kotlin/androidx/lifecycle/ReportFragment.android.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/ViewModelStore.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/ViewModel.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel/src/jvmAndAndroidMain/kotlin/androidx/lifecycle/ViewModel.jvmAndAndroid.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/viewmodel/internal/ViewModelImpl.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/viewmodel/internal/ViewModelProviderImpl.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel-compose/src/commonMain/kotlin/androidx/lifecycle/viewmodel/compose/ViewModel.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel-compose/src/commonMain/kotlin/androidx/lifecycle/viewmodel/compose/LocalViewModelStoreOwner.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel-compose/src/androidMain/kotlin/androidx/lifecycle/viewmodel/compose/LocalViewModelStoreOwner.android.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-viewmodel/src/androidMain/kotlin/androidx/lifecycle/ViewTreeViewModelStoreOwner.android.kt
rebuild: true
device: true
drafted: ai
edited_by: Gurpreet Singh
---
