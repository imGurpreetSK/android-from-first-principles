import { describe, expect, test } from 'vitest';
import { z } from 'astro/zod';
import { docsSchema } from '@astrojs/starlight/schema';
import { frontmatter } from '../src/frontmatter';
import { sections } from '../src/sections';

// The same schema as the docs collection. The image helper is a stub, because no test page has an image.
const schema = docsSchema({ extend: frontmatter })({ image: () => z.string() } as never);

const chapter = {
  title: 'The main thread: Looper, Handler, MessageQueue',
  section: 'The Launch Path',
  sidebar: { order: 5 },
  checked: { android: 17, aosp: 'android-17.0.0_r1' },
  sources: ['https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java'],
  rebuild: true,
  device: false,
  drafted: 'ai',
  edited_by: 'Gurpreet Singh',
};

const emulator = { image: 'system-images;android-37.0;google_apis;arm64-v8a', revision: 8 };

const valid = (data: object) => schema.safeParse(data).success;
// The issue messages of the chapter with these sources.
const messages = (sources: string[]) => schema.safeParse({ ...chapter, sources }).error?.issues.map((issue) => issue.message) ?? [];
// The chapter with these fields changed in checked.
const checked = (fields: object) => ({ ...chapter, checked: { ...chapter.checked, ...fields } });

describe('chapter frontmatter', () => {
  test('accepts a chapter', () => {
    expect(valid(chapter)).toBe(true);
  });

  test('accepts a chapter with device prompts and the emulator in checked', () => {
    expect(valid({ ...checked({ emulator }), device: true })).toBe(true);
  });

  test('accepts library versions and a Play services version in checked', () => {
    expect(valid(checked({ libraries: { 'androidx.lifecycle': '2.10.0' }, play_services: '25.10.31' }))).toBe(true);
  });

  test.each(Object.keys(chapter))('rejects a chapter without %s', (field) => {
    const { [field]: _, ...rest } = chapter as Record<string, unknown>;
    expect(valid(rest)).toBe(false);
  });

  test('rejects a chapter with a sidebar field without order', () => {
    expect(valid({ ...chapter, sidebar: { label: 'Main thread' } })).toBe(false);
  });

  test('rejects an empty section', () => {
    expect(valid({ ...chapter, section: '' })).toBe(false);
  });

  test.each(sections.map((s) => s.label))('accepts the section %s', (section) => {
    expect(valid({ ...chapter, section })).toBe(true);
  });

  test.each(['Launch Path', 'the launch path', 'launch-path'])('rejects the section %s, because it is not a section name', (section) => {
    expect(valid({ ...chapter, section })).toBe(false);
  });

  test('rejects an AOSP tag of a different release', () => {
    expect(valid(checked({ aosp: 'android-16.0.0_r1' }))).toBe(false);
  });

  test('rejects a release that is not a number', () => {
    expect(valid(checked({ android: '17' }))).toBe(false);
  });

  test.each(['android-17', 'android-17.0.0', 'refs/tags/android-17.0.0_r1'])('rejects the AOSP tag %s', (aosp) => {
    expect(valid(checked({ aosp }))).toBe(false);
  });

  // YAML reads an unquoted 2.10 as the number 2.1.
  test('rejects a library version that is a number', () => {
    expect(valid(checked({ libraries: { 'androidx.lifecycle': 2.1 } }))).toBe(false);
  });

  test('rejects an empty sources list', () => {
    expect(valid({ ...chapter, sources: [] })).toBe(false);
  });

  test.each(['not a url', 'javascript:alert(1)', 'mailto:someone@example.com'])(
    'rejects the source %s, because it is not an http or https URL',
    (source) => {
      expect(valid({ ...chapter, sources: [source] })).toBe(false);
    },
  );

  // CI removes the anchor and the timestamp from each citation, then needs an exact match with a source (src/citations.ts).
  test('rejects a source with an anchor', () => {
    expect(valid({ ...chapter, sources: [`${chapter.sources[0]}#42`] })).toBe(false);
  });

  test('rejects a talk source with a timestamp', () => {
    expect(valid({ ...chapter, sources: ['https://www.youtube.com/watch?v=abc123&t=95s'] })).toBe(false);
  });

  // docs/DESIGN.md "Sourcing rules": a code link points to a pinned ref.
  test.each([
    'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java',
    'https://android.googlesource.com/platform/frameworks/support/+/0123456789abcdef0123456789abcdef01234567/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/ViewModel.kt',
  ])('accepts the pinned Gitiles source %s', (source) => {
    expect(messages([source])).toEqual([]);
  });

  test.each([
    // A short ref of a tag, a short ref of a branch, a full ref of a branch, a short SHA and no ref.
    'https://android.googlesource.com/platform/frameworks/base/+/android-17.0.0_r1/core/java/android/os/Looper.java',
    'https://android.googlesource.com/platform/frameworks/base/+/main/core/java/android/os/Looper.java',
    'https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/os/Looper.java',
    'https://android.googlesource.com/platform/frameworks/base/+/0123456789ab/core/java/android/os/Looper.java',
    'https://android.googlesource.com/platform/frameworks/base/',
  ])('rejects the Gitiles source %s, because it is not pinned to a tag or a full SHA, and names the source', (source) => {
    expect(messages([source])).toEqual([expect.stringContaining(`${source}: Pin the Gitiles link to a tag or to a commit.`)]);
  });

  test.each([
    'https://r8.googlesource.com/r8/+/refs/tags/8.5.35/src/main/java/com/android/tools/r8/R8.java',
    'https://android.googlesource.com/platform/tools/base/+/refs/tags/studio-2025.1.1/build-system/gradle-core/src/main/java/com/android/build/gradle/BaseExtension.kt',
    'https://android.googlesource.com/platform/tools/base/+/refs/tags/studio-2025.1.1/build-system/gradle-core/src/main/java/com/android/builder/core/AbstractBuildType.kt',
    // The resource shrinker of R8 has the AGP package path com/android/build/.
    'https://r8.googlesource.com/r8/+/refs/tags/8.5.35/src/resourceshrinker/java/com/android/build/shrinker/ResourceShrinkerImpl.kt',
    // A doc page of the AGP API is not code.
    'https://developer.android.com/reference/tools/gradle-api/8.7/com/android/build/api/dsl/ApplicationExtension',
    // GitHub code outside the AOSP and AndroidX mirrors, and not R8 or AGP code. AndroidX Media (androidx/media) is not in platform/frameworks/support, so its home is GitHub. The GitHub tag check in CI checks its ref.
    'https://github.com/Kotlin/kotlinx.coroutines/blob/1.10.2/kotlinx-coroutines-core/common/src/Builders.common.kt',
    'https://github.com/androidx/media/blob/1.5.0/README.md',
    'https://github.com/android/nowinandroid/blob/0123456789abcdef0123456789abcdef01234567/README.md',
  ])('accepts the source %s on the host of its project', (source) => {
    expect(messages([source])).toEqual([]);
  });

  test.each([
    ['https://cs.android.com/android/platform/superproject/+/android-17.0.0_r1:frameworks/base/core/java/android/os/Looper.java', 'Do not cite cs.android.com.'],
    ['https://raw.githubusercontent.com/Kotlin/kotlinx.coroutines/master/README.md', 'Cite the file on github.com'],
    ['https://www.github.com/Kotlin/kotlinx.coroutines/blob/master/README.md', 'Cite the file on github.com'],
    ['https://android-review.googlesource.com/c/platform/tools/build/+/1848036', 'Do not cite a Gerrit change.'],
    ['https://r.android.com/1848036', 'Do not cite a Gerrit change.'],
    ['https://github.com/aosp-mirror/platform_frameworks_base/blob/0123456789abcdef0123456789abcdef01234567/core/java/android/os/Looper.java', 'Cite AOSP and AndroidX code on android.googlesource.com'],
    ['https://github.com/android/platform_frameworks_base/blob/0123456789abcdef0123456789abcdef01234567/core/java/android/os/Looper.java', 'Cite AOSP and AndroidX code on android.googlesource.com'],
    ['https://github.com/LineageOS/android_frameworks_base/blob/00596dcbd6f884e7da2c24c28228575a15763007/core/java/android/os/Looper.java', 'Cite AOSP and AndroidX code on android.googlesource.com'],
    ['https://github.com/androidx/androidx/blob/0123456789abcdef0123456789abcdef01234567/lifecycle/lifecycle-viewmodel/src/commonMain/kotlin/androidx/lifecycle/ViewModel.kt', 'Cite AOSP and AndroidX code on android.googlesource.com'],
    ['https://github.com/example/r8/blob/0123456789abcdef0123456789abcdef01234567/src/main/java/com/android/tools/r8/R8.java', 'Cite R8 code on r8.googlesource.com.'],
    ['https://android.googlesource.com/platform/external/r8/+/0123456789abcdef0123456789abcdef01234567/src/main/java/com/android/tools/r8/R8.java', 'Cite R8 code on r8.googlesource.com.'],
    ['https://github.com/example/agp/blob/0123456789abcdef0123456789abcdef01234567/src/main/java/com/android/build/gradle/BaseExtension.kt', 'Cite AGP code in platform/tools/base'],
    ['https://github.com/example/agp/blob/0123456789abcdef0123456789abcdef01234567/build-system/gradle-core/src/main/java/com/android/builder/core/AbstractBuildType.kt', 'Cite AGP code in platform/tools/base'],
    // The AGP repo before platform/tools/base.
    ['https://android.googlesource.com/platform/tools/build/+/0123456789abcdef0123456789abcdef01234567/gradle/src/main/groovy/com/android/build/gradle/AppPlugin.groovy', 'Cite AGP code in platform/tools/base'],
  ])('rejects the source %s, because it is not on the host of its project, and names the source', (source, fix) => {
    expect(messages([source])).toEqual([expect.stringContaining(`${source}: ${fix}`)]);
  });

  test.each(['', ' '])('rejects the edited_by value "%s"', (edited_by) => {
    expect(valid({ ...chapter, edited_by })).toBe(false);
  });

  test('rejects drafted other than ai or human', () => {
    expect(valid({ ...chapter, drafted: 'robot' })).toBe(false);
  });

  test.each(['rebuild', 'device'])('rejects %s that is not a boolean', (field) => {
    expect(valid({ ...chapter, [field]: 'yes' })).toBe(false);
  });

  test('rejects device true without the emulator in checked', () => {
    expect(valid({ ...chapter, device: true })).toBe(false);
  });

  test('rejects an emulator without a revision', () => {
    expect(valid({ ...checked({ emulator: { image: emulator.image } }), device: true })).toBe(false);
  });

  test('rejects device false with the emulator in checked', () => {
    expect(valid(checked({ emulator }))).toBe(false);
  });
});

describe('page frontmatter', () => {
  test('accepts a page without chapter fields, for example the home page', () => {
    expect(valid({ title: 'Android from First Principles', template: 'splash' })).toBe(true);
  });

  test('rejects a page with only some chapter fields', () => {
    expect(valid({ title: 'About', section: 'The Launch Path' })).toBe(false);
  });
});
