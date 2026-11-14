import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  chapter = read('chapter/index.html');
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

test('a page without chapter fields shows no checked stamp', () => {
  expect(notChapter.includes('checked-stamp')).toBe(false);
});
