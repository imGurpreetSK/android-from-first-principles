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

  // CI removes the anchor from each citation, then needs an exact match with a source.
  test('rejects a source with an anchor', () => {
    expect(valid({ ...chapter, sources: [`${chapter.sources[0]}#42`] })).toBe(false);
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
