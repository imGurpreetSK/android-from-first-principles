import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { afterAll, beforeAll, expect, test } from 'vitest';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
// A separate Astro root, so the built site does not get a page for the fixture.
const fixture = fileURLToPath(new URL('./fixtures/chapter', import.meta.url));
// An output directory outside the site, so astro check does not check the built files.
const outDir = mkdtempSync(join(tmpdir(), 'afp-chapter-'));
const read = (page: string) => readFileSync(join(outDir, page), 'utf8');
let chapter = '';
// The Starlight 404 page has no chapter fields.
let notChapter = '';

beforeAll(() => {
  // --force clears the content cache, so the build uses the current fixture.
  // spawnSync blocks the thread, so the hook timeout cannot stop a stuck build. The spawnSync timeout stops it.
  const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', fixture, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000 });
  expect(status, stdout + stderr).toBe(0);
  chapter = read('launch-path/chapter/index.html');
  notChapter = read('404.html');
}, 60_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

test('a chapter shows the checked stamp at the top of its content', () => {
  const stamp = chapter.match(/<div class="sl-markdown-content"><div class="checked-stamp">([\s\S]*?)<\/div>/)?.[1];
  for (const text of [
    'Android 17, AOSP tag <code>android-17.0.0_r1</code>',
    'kotlin 2.4.21',
    'androidx.lifecycle 2.10.0',
    'Play services 25.10.31',
    'Emulator system image <code>system-images;android-37.0;google_apis;arm64-v8a</code>, revision 8',
  ]) {
    expect(stamp, text).toContain(text);
  }
});

test('a chapter without optional checked fields shows only the Android line in its stamp', () => {
  const stamp = read('launch-path/human/index.html').match(/<div class="checked-stamp">([\s\S]*?)<\/div>/)?.[1] ?? '';
  expect(stamp.match(/<li>/g)).toEqual(['<li>']);
});

test('a page without chapter fields shows no checked stamp', () => {
  expect(notChapter.includes('checked-stamp')).toBe(false);
});

test('a chapter lists each of its sources at the end of its content', () => {
  // The sources of the fixture chapter, in order.
  const sources = [
    'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Looper.java',
    'https://developer.android.com/guide/components/processes-and-threads',
  ];
  // The list is the last item before the end of the chapter content.
  const list = chapter.match(/<h2 id="sources">Sources<\/h2>[\s\S]*?<\/div><ul>((?:(?!<\/ul>)[\s\S])*)<\/ul><\/div>/)?.[1] ?? '';
  expect([...list.matchAll(/<li><a href="([^"]+)">\1<\/a><\/li>/g)].map(([, url]) => url)).toEqual(sources);
});

test('a page without chapter fields lists no sources', () => {
  expect(notChapter.includes('id="sources"')).toBe(false);
});

test('a chapter ends with a hidden progress tracker: a "Mark as read" button and an "X / N" counter, where N is the number of chapters on the site', () => {
  const tracker = chapter.match(/<p class="progress[ "][^>]*>[\s\S]*?<\/p>/)?.[0] ?? '';
  // After the sources list, before the page footer.
  expect(chapter.indexOf('id="sources"')).toBeLessThan(chapter.indexOf(tracker));
  expect(chapter.indexOf(tracker)).toBeLessThan(chapter.indexOf('<footer'));
  // The fixture has the chapters "chapter" and "human", and a home page without chapter fields. Thus N is 2.
  // The script shows the tracker only if it can read the storage. Thus without JavaScript, the tracker stays hidden.
  expect(tracker).toContain(' data-slug="chapter" data-slugs="chapter human" data-pagefind-ignore hidden>');
  expect(tracker).toMatch(/<button type="button" aria-pressed="false"[^>]*>Mark as read<\/button>/);
  expect(tracker.replace(/<[^>]*>/g, '')).toBe('Mark as read0 / 2 chapters read');
});

test.each(['404.html', 'index.html'])('the page %s has no chapter fields, so it has no progress tracker and no tracker script', (page) => {
  const html = read(page);
  expect(html).not.toContain('Mark as read');
  // The script stores each chapter under the key read:<chapter-slug>.
  expect(html).not.toContain('read:');
});

test.each([
  ['ai', 'launch-path/chapter/index.html', 'Drafted with AI, edited by Gurpreet Singh'],
  ['human', 'launch-path/human/index.html', 'Written by Jane Doe'],
])('a chapter with drafted: %s shows its line in the page footer', (_, page, line) => {
  expect(new RegExp(`<div class="meta[ "][^>]*>(?:(?!</div>)[\\s\\S])*<p>${line}</p></div>`).test(read(page)), line).toBe(true);
});

test('a page without chapter fields shows no drafted line', () => {
  expect(/Drafted with AI|Written by/.test(notChapter)).toBe(false);
});

test('each page shows the license line and the credit line', () => {
  const pages = readdirSync(outDir, { recursive: true, encoding: 'utf8' }).filter((name) => name.endsWith('.html'));
  expect(pages.sort()).toEqual(['404.html', 'index.html', 'launch-path/chapter/index.html', 'launch-path/human/index.html']);
  for (const page of pages) {
    const html = read(page);
    const text = html.replace(/<[^>]*>/g, '');
    const lines = [
      'The text and the site code have the CC BY-SA 4.0 license. The sample code has the MIT license. Quoted third-party code keeps its own license.',
      'Format inspired by Backend from First Principles',
    ];
    for (const line of lines) expect(text.includes(line), `${page}: ${line}`).toBe(true);
    const links = [...html.matchAll(/<a href="([^"]+)"[^>]*>([^<]*)<\/a>/g)].map(([, href, label]) => `${label} ${href}`);
    expect(links, page).toEqual(
      expect.arrayContaining([
        'CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/',
        'MIT https://github.com/imGurpreetSK/android-from-first-principles/blob/main/samples/LICENSE',
        'Backend from First Principles https://github.com/DsThakurRawat/Backend-from-first-Principle',
      ]),
    );
  }
});

test('the search index has no drafted line, license line, credit line or progress tracker', () => {
  const dir = join(outDir, 'pagefind', 'fragment');
  const fragments = readdirSync(dir).map((name) => gunzipSync(readFileSync(join(dir, name))).toString('utf8'));
  expect(fragments).toHaveLength(2);
  for (const fragment of fragments) {
    expect(fragment).toMatch(/The body of the fixture chapter/);
    expect(fragment).not.toMatch(/Drafted with AI|Written by|license|Format inspired by|Mark as read|chapters read/);
  }
});
