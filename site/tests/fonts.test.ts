import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, test } from 'vitest';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
const root = fileURLToPath(new URL('..', import.meta.url));
// A separate output directory, so the test does not change dist/.
const outDir = mkdtempSync(join(tmpdir(), 'afp-site-'));
// The site has no chapters yet, so the build has only the Starlight 404 page. That page loads the custom CSS.
let files: { name: string; text: string }[] = [];

beforeAll(() => {
  // spawnSync blocks the thread, so the hook timeout cannot stop a stuck build. The spawnSync timeout stops it.
  const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', root, '--outDir', outDir], { encoding: 'utf8', timeout: 60_000 });
  expect(status, stdout + stderr).toBe(0);
  files = readdirSync(outDir, { recursive: true, encoding: 'utf8' })
    .filter((name) => /\.(html|css)$/.test(name))
    .map((name) => ({ name, text: readFileSync(join(outDir, name), 'utf8') }));
}, 60_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

test('no built HTML or CSS file loads a font or a stylesheet from another host', () => {
  expect(files.length).toBeGreaterThan(0);
  for (const { name, text } of files) {
    // The match is the only text in the failure message, so a long minified file does not fill the output.
    expect(text.match(/fonts\.(googleapis|gstatic)\.com|(url\(|@import)\s*["']?(https?:)?\/\/[^"')\s]*/)?.[0], name).toBeUndefined();
    const links = (text.match(/<link\b[^>]*>/g) ?? [])
      .filter((tag) => /\brel="?(stylesheet|preload|preconnect)\b/.test(tag) && /\bhref="?(https?:)?\/\//.test(tag));
    expect(links, name).toEqual([]);
  }
});

test.each([
  ['Roboto', ['400', '600', '700']],
  ['Roboto Mono', ['400', '600']],
])('the built CSS has @font-face rules for %s in weights %j with font files on the site', (family, weights) => {
  const css = files.filter(({ name }) => name.endsWith('.css')).map(({ text }) => text).join('\n');
  const rules = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)]
    .map(([, body]) => body)
    .filter((body) => new RegExp(`font-family:\\s*["']?${family}["']?\\s*(;|$)`).test(body));
  expect(rules).not.toHaveLength(0);
  for (const weight of weights) expect(rules.some((body) => new RegExp(`font-weight:\\s*${weight}\\s*(;|$)`).test(body)), weight).toBe(true);
  for (const body of rules) {
    const urls = [...body.matchAll(/url\(\s*["']?([^"')]+)/g)].map(([, url]) => url);
    expect(urls, family).not.toHaveLength(0);
    // Vite puts a small font file into the CSS as a data URL.
    for (const url of urls) expect(url.startsWith('data:') || existsSync(join(outDir, url)), url.slice(0, 80)).toBe(true);
  }
});

test.each([
  ['--sl-font', 'Roboto'],
  ['--sl-font-mono', 'Roboto Mono'],
])('the built CSS sets %s to %s', (property, family) => {
  const css = files.filter(({ name }) => name.endsWith('.css')).map(({ text }) => text).join('\n');
  expect(new RegExp(`${property}:\\s*["']?${family}["']?\\s*[;}]`).test(css), property).toBe(true);
});

test('a printed page gets the light accent color in each theme', () => {
  // The CSS files in the order that the page links them. Of the unlayered :root rules, the last one wins.
  const page = files.find(({ name }) => name === '404.html')!.text;
  const css = [...page.matchAll(/<link rel="stylesheet" href="\/([^"]+)"/g)]
    .map(([, href]) => files.find(({ name }) => name === href)!.text)
    .join('\n');
  const accents = [...css.matchAll(/(?:^|\})(@media print\{)?:root\{[^}]*--sl-color-accent:([^;}]+)/g)];
  expect(accents.at(-1)?.slice(1)).toEqual(['@media print{', '#00753b']);
});
