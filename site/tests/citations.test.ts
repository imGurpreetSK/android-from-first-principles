import { describe, expect, test } from 'vitest';
import { missingSource } from '../src/citations';

const looper = 'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java';
const page = 'https://developer.android.com/reference/android/os/Looper';
const talk = 'https://www.youtube.com/watch?v=abc123';
const sources = [looper, page, talk];

describe('missingSource', () => {
  test.each([
    ['a source', looper],
    ['a Gitiles line', `${looper}#160`],
    ['a GitHub line range', 'https://github.com/Kotlin/kotlinx.coroutines/blob/1.10.2/README.md#L10-L20'],
    ['a doc page heading', `${page}#loop()`],
    ['a talk timestamp', `${talk}&t=95s`],
    ['a talk timestamp before the video ID', 'https://www.youtube.com/watch?t=95&v=abc123'],
    ['a talk timestamp in a short link', 'https://youtu.be/abc123?t=95'],
  ])('accepts a link to %s', (_, link) => {
    expect(missingSource(link, [...sources, 'https://github.com/Kotlin/kotlinx.coroutines/blob/1.10.2/README.md', 'https://youtu.be/abc123'])).toBeUndefined();
  });

  test.each([
    ['a page that is not a source', 'https://developer.android.com/guide', 'https://developer.android.com/guide'],
    ['a different file at the same ref', `${looper.replace('Looper', 'Handler')}#100`, looper.replace('Looper', 'Handler')],
    ['a source at a different ref', looper.replace('_r1', '_r2'), looper.replace('_r1', '_r2')],
    ['a source with a query', `${page}?hl=de`, `${page}?hl=de`],
    ['a source with a trailing slash', `${page}/`, `${page}/`],
    ['a source over http', looper.replace('https', 'http'), looper.replace('https', 'http')],
    ['a t query parameter on a host that is not YouTube', 'https://example.com/p?t=5', 'https://example.com/p?t=5'],
    ['a protocol-relative link', '//developer.android.com/guide', '//developer.android.com/guide'],
  ])('returns the link without its anchor and timestamp for %s', (_, link, source) => {
    expect(missingSource(link, sources)).toBe(source);
  });

  test.each([
    ['a chapter', '/launch-path/zygote/'],
    ['a chapter by a relative path', '../binder/'],
    ['a heading of the same chapter', '#the-problem'],
    ['the repo', 'https://github.com/imGurpreetSK/android-from-first-principles'],
    ['a file of the repo', 'https://github.com/imGurpreetSK/android-from-first-principles/blob/main/CONTRIBUTING.md#challenge-a-claim'],
    ['the issue form of the repo', 'https://github.com/imGurpreetSK/android-from-first-principles/issues/new?template=challenge-a-claim.yml'],
  ])('accepts a link to %s, which is exempt', (_, link) => {
    expect(missingSource(link, sources)).toBeUndefined();
  });

  test('rejects a link to a different repo with the same name prefix', () => {
    const link = 'https://github.com/imGurpreetSK/android-from-first-principles-fork/blob/main/README.md';
    expect(missingSource(link, sources)).toBe(link);
  });
});
