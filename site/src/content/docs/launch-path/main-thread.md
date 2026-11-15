---
title: "Main thread: Looper / Handler / MessageQueue"
section: The Launch Path
sidebar:
  order: 5
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { kotlinx.coroutines: "1.11.0" }
  emulator: { image: "system-images;android-37.0;google_apis;arm64-v8a", revision: 8 }
sources:
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Handler.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/CombinedDeliMessageQueue/MessageQueue.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/CombinedDeliMessageQueue/README.md
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Message.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/app/ActivityThread.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/jni/android_os_MessageQueue.cpp
  - https://android.googlesource.com/platform/system/core/+/refs/tags/android-17.0.0_r1/libutils/Looper.cpp
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/view/ViewRootImpl.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/Android.bp
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/ui/kotlinx-coroutines-android/src/HandlerDispatcher.kt
  - https://developer.android.com/guide/components/processes-and-threads
  - https://developer.android.com/about/versions/17/behavior-changes-17
  - https://developer.android.com/about/versions/17/changes/messagequeue
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-11.0.0_r1/core/java/android/os/Handler.java
  - https://android.googlesource.com/platform/system/core/+/refs/tags/android-17.0.0_r1/debuggerd/debuggerd.cpp
  - https://android.googlesource.com/platform/packages/modules/adb/+/refs/tags/android-17.0.0_r1/daemon/main.cpp
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/app/Activity.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/view/View.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/MessageStack.java
rebuild: true
device: true
drafted: ai
edited_by: Gurpreet Singh
---
