import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
// Each fixture is a separate Astro root, so the built site does not get a page for a fixture.
const fixture = fileURLToPath(new URL('./fixtures/invalid-chapter', import.meta.url));
const goDeeper = fileURLToPath(new URL('./fixtures/go-deeper', import.meta.url));
const goDeeperNoTitle = fileURLToPath(new URL('./fixtures/go-deeper-no-title', import.meta.url));
// The Astro root of this fixture is next to its samples/, as site/ is next to samples/ in the repo.
const snippetFixture = new URL('./fixtures/snippet/site/', import.meta.url);
const duplicateSlug = fileURLToPath(new URL('./fixtures/duplicate-slug', import.meta.url));
const duplicateId = fileURLToPath(new URL('./fixtures/duplicate-id', import.meta.url));
const sidebar = fileURLToPath(new URL('./fixtures/sidebar', import.meta.url));
const citation = fileURLToPath(new URL('./fixtures/citation', import.meta.url));
const citationMismatch = fileURLToPath(new URL('./fixtures/citation-mismatch', import.meta.url));
const citationHtml = fileURLToPath(new URL('./fixtures/citation-html', import.meta.url));
// Run the citation fixture builds in production mode, as the CI build does. Vitest sets process.env.MODE to test, and a child process inherits it.
const production = { ...process.env, MODE: 'production' };

test('astro build fails on a chapter with invalid frontmatter', () => {
  // --force clears the content cache, so the build checks the fixture with the current schema.
  // spawnSync blocks the thread, so the test timeout cannot stop a stuck build. The spawnSync timeout stops it.
  const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', fixture, '--force'], { encoding: 'utf8', timeout: 60_000 });
  expect(status).not.toBe(0);
  expect(stdout + stderr).toMatch(/InvalidContentEntryDataError[\s\S]*drafted/);
}, 60_000);

test('a Go deeper box is a closed <details> element that starts with its <summary>', () => {
  // The output directory is outside site/, so astro check does not check the built JavaScript.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-go-deeper-'));
  try {
    const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', goDeeper, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000 });
    expect(status, stdout + stderr).toBe(0);
    const html = readFileSync(join(outDir, 'go-deeper/index.html'), 'utf8');
    // The box is in the static HTML, so it works without JavaScript. Without the open attribute, <details> is closed: https://html.spec.whatwg.org/multipage/interactive-elements.html#attr-details-open
    // A click on its <summary> opens and closes it: https://html.spec.whatwg.org/multipage/interactive-elements.html#the-summary-element
    // The HTML spec suggests that browsers let the keyboard focus the first <summary> of a <details> element. Platform conventions can change this: https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
    // The HTML spec also tells browsers to let the keyboard activate that <summary>, as a click does: https://html.spec.whatwg.org/multipage/interaction.html#activation
    // The page also has the <details> element of the Starlight mobile table of contents.
    expect(html.match(/<details[^>]*><summary[^>]*>Go deeper:[\s\S]*?<\/details>/g)).toEqual(['<details><summary>Go deeper: Binder</summary><p>The box text.</p></details>']);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build fails on a Go deeper box without a title', () => {
  // The failed build also writes files. The output directory is outside site/, so astro check does not check them.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-go-deeper-no-title-'));
  try {
    const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', goDeeperNoTitle, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000 });
    expect(status).not.toBe(0);
    expect(stdout + stderr).toContain('<GoDeeper> needs a title.');
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build shows the region of a Snippet in a code block, without the marker lines', () => {
  const { status, stderr } = spawnSync(astro, ['build', '--root', fileURLToPath(snippetFixture), '--force'], { encoding: 'utf8', timeout: 60_000 });
  expect(status, stderr).toBe(0);
  const html = readFileSync(new URL('dist/snippet/index.html', snippetFixture), 'utf8');
  const pre = html.match(/<pre data-language="kt">([\s\S]*?)<\/pre>/)?.[1] ?? '';
  // Expressive Code puts each code line in a div of the class ec-line.
  const lines = pre.split('<div class="ec-line">').slice(1).map((line) => line.replace(/<[^>]+>/g, ''));
  expect(lines).toEqual(['fun loop() {', '    while (true) println("loop")', '}']);
}, 60_000);

test('astro build fails on two chapters with the same chapter slug in different sections', () => {
  const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', duplicateSlug, '--force'], { encoding: 'utf8', timeout: 60_000 });
  expect(status).not.toBe(0);
  expect(stdout + stderr).toContain('same chapter slug "main-thread"');
}, 60_000);

test('astro build fails on two files with the same chapter slug in one section', () => {
  // If the build does not fail, it writes into an output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-duplicate-id-'));
  try {
    const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', duplicateId, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000 });
    expect(status).not.toBe(0);
    expect(stdout + stderr).toContain('DuplicateContentEntrySlugError');
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build puts each chapter at /<section-slug>/<chapter-slug>/, and the sidebar shows only the sections with a chapter and numbers the chapters in sidebar order', () => {
  // An output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-sidebar-'));
  try {
    const { status, stderr } = spawnSync(astro, ['build', '--root', sidebar, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000 });
    expect(status, stderr).toBe(0);
    expect(existsSync(join(outDir, 'concurrency/flow/index.html'))).toBe(true);
    const html = readFileSync(join(outDir, 'launch-path/main-thread/index.html'), 'utf8');
    // Starlight gives the label of each sidebar group the class "large". While the fixture has no nested group, each match is a section. The fixture has no chapter in "State & Survival", the second section.
    const groups = [...html.matchAll(/<span class="large[ "][^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
    expect(groups).toEqual(['The Launch Path', 'Concurrency']);
    // The numbers continue across sections.
    expect(html).toContain('>01 Main thread</span>');
    expect(html).toContain('>02 Flow</span>');
    // The next link keeps the label without the number.
    expect(html).toMatch(/<span class="link-title[ "][^>]*>Flow<\/span>/);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build passes on a chapter whose links cite its sources or are exempt, and on a page without sources', () => {
  // An output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-citation-'));
  try {
    const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', citation, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000, env: production });
    expect(status, stdout + stderr).toBe(0);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build fails on a chapter with links that cite no entry in its sources, and names the file and each link', () => {
  // The failed build also writes files. The output directory is outside site/, so astro check does not check them.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-citation-mismatch-'));
  try {
    const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', citationMismatch, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000, env: production });
    expect(status).not.toBe(0);
    // The inline link, the JSX <a> link, the JSX <a> link with an href in braces, the LinkCard and the two reference links. The link that cites a source is not in the list.
    expect(stdout + stderr).toContain(
      `The chapter ${join(citationMismatch, 'src/content/docs/launch-path/main-thread.mdx')} has links that cite no entry in its sources field: https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/core/java/android/os/Handler.java#100, https://developer.android.com/guide, href={…}, https://developer.android.com/guide/components/processes-and-threads, https://developer.android.com/reference/android/os/Looper#loop(), https://x.example/d.png. The check removes the anchor and the timestamp`,
    );
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build fails on a .md chapter with an HTML link that cites no entry in its sources, and names the link', () => {
  // The failed build also writes files. The output directory is outside site/, so astro check does not check them.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-citation-html-'));
  try {
    const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', citationHtml, '--outDir', outDir, '--force'], { encoding: 'utf8', timeout: 60_000, env: production });
    expect(status).not.toBe(0);
    expect(stdout + stderr).toContain(
      `The chapter ${join(citationHtml, 'src/content/docs/launch-path/main-thread.md')} has links that cite no entry in its sources field: https://developer.android.com/guide.`,
    );
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);
