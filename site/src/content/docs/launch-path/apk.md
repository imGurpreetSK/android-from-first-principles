---
title: "APK: what the build actually produces"
section: The Launch Path
sidebar:
  order: 1
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { agp: "9.5.0" }
  emulator: { image: "system-images;android-37.0;google_apis;arm64-v8a", revision: 8 }
sources:
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/content/pm/parsing/ApkLiteParseUtils.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/com/android/internal/pm/pkg/parsing/ParsingPackageUtils.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/pm/PackageManagerServiceUtils.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/libs/androidfw/ApkAssets.cpp
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/libs/androidfw/Asset.cpp
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/libs/androidfw/include/androidfw/ResourceTypes.h
  - https://android.googlesource.com/platform/art/+/refs/tags/android-17.0.0_r1/libdexfile/dex/dex_file_loader.cc
  - https://android.googlesource.com/platform/art/+/refs/tags/android-17.0.0_r1/dex2oat/linker/oat_writer.cc
  - https://android.googlesource.com/platform/art/+/refs/tags/android-17.0.0_r1/dex2oat/dex2oat.cc
  - https://android.googlesource.com/platform/art/+/refs/tags/android-17.0.0_r1/libdexfile/dex/standard_dex_file.cc
  - https://android.googlesource.com/platform/build/+/refs/tags/android-17.0.0_r1/tools/zipalign/ZipAlign.cpp
  - https://android.googlesource.com/platform/build/+/refs/tags/android-17.0.0_r1/tools/zipalign/ZipFile.cpp
  - https://android.googlesource.com/platform/tools/base/+/refs/tags/studio-2026.2.2/build-system/builder/src/main/java/com/android/builder/internal/packaging/ApkFlinger.kt
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/jni/com_android_internal_content_NativeLibraryHelper.cpp
  - https://android.googlesource.com/platform/system/libziparchive/+/refs/tags/android-17.0.0_r1/ziptool.cpp
  - https://android.googlesource.com/platform/system/libziparchive/+/refs/tags/android-17.0.0_r1/zip_archive.cc
  - https://android.googlesource.com/platform/system/libziparchive/+/refs/tags/android-17.0.0_r1/zip_archive_common.h
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/util/apk/ApkSigningBlockUtils.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/util/apk/ApkSignatureVerifier.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-11.0.0_r1/services/core/java/com/android/server/pm/PackageManagerService.java
  - https://developer.android.com/tools/aapt2
  - https://developer.android.com/tools/d8
  - https://source.android.com/docs/core/runtime/dex-format
  - https://developer.android.com/build/multidex
  - https://developer.android.com/tools/zipalign
  - https://source.android.com/docs/security/features/apksigning/v2
  - https://developer.android.com/ndk/guides/abis
  - https://developer.android.com/reference/tools/gradle-api/9.5/com/android/build/api/dsl/DexPackaging
  - https://developer.android.com/about/versions/11/behavior-changes-11
  - https://developer.android.com/about/versions/15/behavior-changes-all
  - https://developer.android.com/about/versions/16/behavior-changes-all
rebuild: true
device: true
drafted: ai
edited_by: Gurpreet Singh
---
