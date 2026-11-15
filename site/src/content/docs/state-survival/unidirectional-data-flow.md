---
title: "Unidirectional data flow"
section: State & Survival
sidebar:
  order: 5
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { kotlinx.coroutines: "1.11.0", androidx.lifecycle: "2.11.0" }
sources:
  - https://developer.android.com/topic/architecture
  - https://developer.android.com/topic/architecture/ui-layer
  - https://developer.android.com/topic/architecture/ui-layer/events
  - https://developer.android.com/topic/architecture/ui-layer/state-production
  - https://developer.android.com/develop/ui/compose/architecture
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/flow/StateFlow.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/flow/operators/Share.kt
  - https://github.com/Kotlin/kotlinx.coroutines/blob/1.11.0/kotlinx-coroutines-core/common/src/channels/Channel.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-runtime-compose/src/commonMain/kotlin/androidx/lifecycle/compose/FlowExt.kt
  - https://android.googlesource.com/platform/frameworks/support/+/a01f1a6c29523dd9b046b7f2a383d7d24559e316/lifecycle/lifecycle-runtime/src/commonMain/kotlin/androidx/lifecycle/RepeatOnLifecycle.kt
rebuild: true
device: false
drafted: ai
edited_by: Gurpreet Singh
---
