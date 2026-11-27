---
title: "Structured concurrency & cancellation"
section: Concurrency
sidebar:
  order: 4
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { kotlinx.coroutines: "1.11.0", androidx.lifecycle: "2.11.1", androidx.compose.runtime: "1.13.0" }
sources:
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/Job.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/JobSupport.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/AbstractCoroutine.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/Builders.common.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/CoroutineScope.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/Supervisor.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/CancellableContinuation.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/CancellableContinuationImpl.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/internal/DispatchedTask.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/Delay.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/Timeout.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/NonCancellable.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/CoroutineExceptionHandler.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/internal/CoroutineExceptionHandlerImpl.common.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/jvm/src/internal/CoroutineExceptionHandlerImpl.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/docs/topics/cancellation-and-timeouts.md
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/docs/topics/exception-handling.md
  - https://android.googlesource.com/platform/frameworks/support/+/def56dbfecf527197bb67c59d6424a4d3fe9d25a/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/ViewModel.kt
  - https://android.googlesource.com/platform/frameworks/support/+/def56dbfecf527197bb67c59d6424a4d3fe9d25a/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/viewmodel/internal/CloseableCoroutineScope.kt
  - https://android.googlesource.com/platform/frameworks/support/+/def56dbfecf527197bb67c59d6424a4d3fe9d25a/lifecycle/lifecycle-common/src/commonMain/kotlin/androidx/lifecycle/Lifecycle.kt
  - https://android.googlesource.com/platform/frameworks/support/+/def56dbfecf527197bb67c59d6424a4d3fe9d25a/lifecycle/lifecycle-common/src/commonMain/kotlin/androidx/lifecycle/LifecycleOwner.kt
  - https://android.googlesource.com/platform/frameworks/support/+/def56dbfecf527197bb67c59d6424a4d3fe9d25a/lifecycle/lifecycle-runtime/src/commonMain/kotlin/androidx/lifecycle/RepeatOnLifecycle.kt
  - https://developer.android.com/kotlin/coroutines/coroutines-best-practices
  - https://android.googlesource.com/platform/frameworks/support/+/ac6d2ce3d991b07d9b981d616bddc6d3ab461eab/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Effects.kt
  - https://developer.android.com/about/versions/15/behavior-changes-all
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/com/android/internal/os/RuntimeInit.java
  - https://android.googlesource.com/platform/libcore/+/refs/tags/android-17.0.0_r1/ojluni/src/main/java/java/lang/Thread.java
  - https://android.googlesource.com/platform/libcore/+/refs/tags/android-17.0.0_r1/ojluni/src/main/java/java/lang/ThreadGroup.java
rebuild: true
device: false
drafted: ai
edited_by: Gurpreet Singh
---
