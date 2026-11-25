import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { build } from './astro';

// Each fixture is a separate Astro root, so the built site does not get a page for a fixture.
const fixture = fileURLToPath(new URL('./fixtures/invalid-chapter', import.meta.url));
const goDeeper = fileURLToPath(new URL('./fixtures/go-deeper', import.meta.url));
const goDeeperNoTitle = fileURLToPath(new URL('./fixtures/go-deeper-no-title', import.meta.url));
// The Astro root of this fixture is next to its samples/, as site/ is next to samples/ in the repo.
const snippetFixture = fileURLToPath(new URL('./fixtures/snippet/site', import.meta.url));
const duplicateSlug = fileURLToPath(new URL('./fixtures/duplicate-slug', import.meta.url));
const duplicateId = fileURLToPath(new URL('./fixtures/duplicate-id', import.meta.url));
const sidebar = fileURLToPath(new URL('./fixtures/sidebar', import.meta.url));
const citation = fileURLToPath(new URL('./fixtures/citation', import.meta.url));
const citationMismatch = fileURLToPath(new URL('./fixtures/citation-mismatch', import.meta.url));
const citationHtml = fileURLToPath(new URL('./fixtures/citation-html', import.meta.url));
const codeLink = fileURLToPath(new URL('./fixtures/code-link', import.meta.url));
// The chapter file of a dry run of /chapter-plan main-thread (.claude/commands/chapter-plan.md).
const chapterPlan = fileURLToPath(new URL('./fixtures/chapter-plan', import.meta.url));
const mermaid = fileURLToPath(new URL('./fixtures/mermaid', import.meta.url));

test('astro build fails on a chapter with invalid frontmatter', () => {
  // --force clears the content cache, so the build checks the fixture with the current schema.
  const { status, stdout, stderr } = build('--root', fixture, '--force');
  expect(status).not.toBe(0);
  expect(stdout + stderr).toMatch(/InvalidContentEntryDataError[\s\S]*drafted/);
}, 60_000);

test('a Go deeper box is a closed <details> element that starts with its <summary>', () => {
  // The output directory is outside site/, so astro check does not check the built JavaScript.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-go-deeper-'));
  try {
    const { status, stdout, stderr } = build('--root', goDeeper, '--outDir', outDir, '--force');
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
    const { status, stdout, stderr } = build('--root', goDeeperNoTitle, '--outDir', outDir, '--force');
    expect(status).not.toBe(0);
    expect(stdout + stderr).toContain('<GoDeeper> needs a title.');
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build shows the region of a Snippet in a code block, without the marker lines', () => {
  // An output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-snippet-'));
  try {
    const { status, stderr } = build('--root', snippetFixture, '--outDir', outDir, '--force');
    expect(status, stderr).toBe(0);
    const html = readFileSync(join(outDir, 'snippet/index.html'), 'utf8');
    const pre = html.match(/<pre data-language="kt">([\s\S]*?)<\/pre>/)?.[1] ?? '';
    // Expressive Code puts each code line in a div of the class ec-line.
    const lines = pre.split('<div class="ec-line">').slice(1).map((line) => line.replace(/<[^>]+>/g, ''));
    expect(lines).toEqual(['fun loop() {', '    while (true) println("loop")', '}']);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build fails on two chapters with the same chapter slug in different sections', () => {
  const { status, stdout, stderr } = build('--root', duplicateSlug, '--force');
  expect(status).not.toBe(0);
  expect(stdout + stderr).toContain('same chapter slug "main-thread"');
}, 60_000);

test('astro build fails on two files with the same chapter slug in one section', () => {
  // If the build does not fail, it writes into an output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-duplicate-id-'));
  try {
    const { status, stdout, stderr } = build('--root', duplicateId, '--outDir', outDir, '--force');
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
    const { status, stderr } = build('--root', sidebar, '--outDir', outDir, '--force');
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
    const { status, stdout, stderr } = build('--root', citation, '--outDir', outDir, '--force');
    expect(status, stdout + stderr).toBe(0);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build fails on a chapter with links that cite no entry in its sources, and names the file and each link', () => {
  // The failed build also writes files. The output directory is outside site/, so astro check does not check them.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-citation-mismatch-'));
  try {
    const { status, stdout, stderr } = build('--root', citationMismatch, '--outDir', outDir, '--force');
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
    const { status, stdout, stderr } = build('--root', citationHtml, '--outDir', outDir, '--force');
    expect(status).not.toBe(0);
    expect(stdout + stderr).toContain(
      `The chapter ${join(citationHtml, 'src/content/docs/launch-path/main-thread.md')} has links that cite no entry in its sources field: https://developer.android.com/guide.`,
    );
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build fails on a chapter with a source that breaks a code link rule, and names the source and the fix', () => {
  // If the build does not fail, it writes into an output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-code-link-'));
  try {
    const { status, stdout, stderr } = build('--root', codeLink, '--outDir', outDir, '--force');
    expect(status).not.toBe(0);
    expect(stdout + stderr).toContain(
      'sources.0: https://android.googlesource.com/platform/frameworks/base/+/main/core/java/android/os/Looper.java: Pin the Gitiles link to a tag or to a commit.',
    );
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build passes on the frontmatter of a /chapter-plan dry run, a chapter without a body, and makes its page', () => {
  // An output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-chapter-plan-'));
  try {
    const { status, stdout, stderr } = build('--root', chapterPlan, '--outDir', outDir, '--force');
    expect(status, stdout + stderr).toBe(0);
    expect(existsSync(join(outDir, 'launch-path/main-thread/index.html'))).toBe(true);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);

test('astro build changes a mermaid code block in MDX to <pre class="mermaid">, not to an Expressive Code block, and a page loads the mermaid package only with a dynamic import', () => {
  // An output directory outside site/, so astro check does not check the built JS files.
  const outDir = mkdtempSync(join(tmpdir(), 'afp-mermaid-'));
  try {
    const { status, stdout, stderr } = build('--root', mermaid, '--outDir', outDir, '--force');
    expect(status, stdout + stderr).toBe(0);
    const html = readFileSync(join(outDir, 'diagram/index.html'), 'utf8');
    // The script of astro-mermaid reads the diagram text from the element. The Sätteri plugin of astro-mermaid escapes &, <, >, " and '. The build keeps the braces of the MDX file.
    expect(html.match(/<pre\b[^>]*\bclass="(?:[^"]* )?mermaid[ "][^>]*>[\s\S]*?<\/pre>/g)).toEqual([
      '<pre class="mermaid">flowchart LR\n  A[Tap] --&gt; B{Process?}\n  B --&gt;|no| C[&quot;fork &amp; start&quot;]</pre>',
    ]);
    // Expressive Code renders the Kotlin code block, but not the diagram.
    expect(html).toContain('<pre data-language="kotlin"');
    expect(html).not.toContain('data-language="mermaid"');
    // At the start, a page loads each module script and each file of their static imports. A dynamic import() loads its file only when it runs.
    const assets = join(outDir, '_astro');
    const chunks = readdirSync(assets).filter((f) => /^mermaid\.core\.[^/]*\.js$/.test(f));
    expect(chunks).toHaveLength(1);
    const page = readFileSync(join(outDir, 'no-diagram/index.html'), 'utf8');
    const loaded = new Set<string>();
    const visit = (code: string) => {
      for (const [, file] of code.matchAll(/\b(?:from|import)\s*["'](?:\.\/|\/_astro\/)([^"']+)["']/g)) {
        if (loaded.has(file)) continue;
        loaded.add(file);
        visit(readFileSync(join(assets, file), 'utf8'));
      }
    };
    for (const [, attributes, body] of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!/\btype="module"/.test(attributes)) continue;
      const src = attributes.match(/\bsrc="\/_astro\/([^"]+)"/)?.[1];
      visit(src ? `import "./${src}"` : body);
    }
    expect([...loaded].filter((f) => f.startsWith('mermaid.'))).toEqual([]);
    // The page script of astro-mermaid runs the import() only if the page has a <pre class="mermaid">.
    expect([...loaded].filter((f) => readFileSync(join(assets, f), 'utf8').includes(`import(\`./${chunks[0]}\`)`))).toHaveLength(1);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 60_000);
