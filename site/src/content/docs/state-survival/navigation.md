---
title: "Navigation & the back stack"
section: State & Survival
sidebar:
  order: 4
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { activity: "1.13.0", navigationevent: "1.2.0", navigation: "2.10.2", navigation3: "1.2.1" }
  emulator: { image: "system-images;android-37.0;google_apis;arm64-v8a", revision: 8 }
sources:
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/window/OnBackInvokedDispatcher.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/window/WindowOnBackInvokedDispatcher.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/view/ViewRootImpl.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/app/Activity.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/wm/ActivityClientController.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/wm/BackNavigationController.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/wm/ActivityStarter.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/com/android/internal/pm/pkg/parsing/ParsingPackageUtils.java
  - https://android.googlesource.com/platform/frameworks/support/+/475afe04599ffc0893939effda40187916c4ceb0/activity/activity/src/main/java/androidx/activity/OnBackPressedDispatcher.kt
  - https://android.googlesource.com/platform/frameworks/support/+/475afe04599ffc0893939effda40187916c4ceb0/activity/activity/src/main/java/androidx/activity/ComponentActivity.kt
  - https://android.googlesource.com/platform/frameworks/support/+/64e18c3822f0ccd7460956afd6ae6f9848877ea7/navigationevent/navigationevent/src/androidMain/kotlin/androidx/navigationevent/OnBackInvokedInput.android.kt
  - https://android.googlesource.com/platform/frameworks/support/+/64e18c3822f0ccd7460956afd6ae6f9848877ea7/navigationevent/navigationevent/src/commonMain/kotlin/androidx/navigationevent/NavigationEventProcessor.kt
  - https://android.googlesource.com/platform/frameworks/support/+/b103583c697f6eae01cb451193bc90d56034380b/navigation/navigation-common/src/commonMain/kotlin/androidx/navigation/NavBackStackEntry.kt
  - https://android.googlesource.com/platform/frameworks/support/+/b103583c697f6eae01cb451193bc90d56034380b/navigation/navigation-runtime/src/commonMain/kotlin/androidx/navigation/internal/NavControllerImpl.kt
  - https://android.googlesource.com/platform/frameworks/support/+/b103583c697f6eae01cb451193bc90d56034380b/navigation/navigation-runtime/src/androidMain/kotlin/androidx/navigation/NavController.android.kt
  - https://android.googlesource.com/platform/frameworks/support/+/b103583c697f6eae01cb451193bc90d56034380b/navigation/navigation-compose/src/commonMain/kotlin/androidx/navigation/compose/NavHost.kt
  - https://android.googlesource.com/platform/frameworks/support/+/b103583c697f6eae01cb451193bc90d56034380b/navigation/navigation-compose/src/commonMain/kotlin/androidx/navigation/compose/NavHostEventHandler.kt
  - https://android.googlesource.com/platform/frameworks/support/+/475afe04599ffc0893939effda40187916c4ceb0/activity/activity-compose/src/main/java/androidx/activity/compose/BackHandler.kt
  - https://android.googlesource.com/platform/frameworks/support/+/65822252146d26e872acf03dc11bda43f11efa3b/navigation3/navigation3-runtime/src/commonMain/kotlin/androidx/navigation3/runtime/NavBackStack.kt
  - https://android.googlesource.com/platform/frameworks/support/+/65822252146d26e872acf03dc11bda43f11efa3b/navigation3/navigation3-runtime/src/commonMain/kotlin/androidx/navigation3/runtime/NavEntry.kt
  - https://developer.android.com/guide/components/activities/tasks-and-back-stack
  - https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture
  - https://developer.android.com/about/versions/10/behavior-changes-all
  - https://developer.android.com/about/versions/12/behavior-changes-all
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-13.0.0_r1/core/java/android/window/WindowOnBackInvokedDispatcher.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-14.0.0_r1/core/java/android/window/OnBackAnimationCallback.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-14.0.0_r1/core/java/android/window/WindowOnBackInvokedDispatcher.java
  - https://developer.android.com/about/versions/15/behavior-changes-all
  - https://developer.android.com/about/versions/15/behavior-changes-15
  - https://developer.android.com/about/versions/16/behavior-changes-16
  - https://developer.android.com/about/versions/16/behavior-changes-all
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/window/OnBackInvokedDispatcher.java
rebuild: true
device: true
drafted: ai
edited_by: Gurpreet Singh
---
