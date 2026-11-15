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
// The site has no chapters yet, so the build has only the home page, the About page and the Starlight 404 page. Each page loads the custom CSS.
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

// The <Font /> component puts the @font-face rules into the head of each page. Keep one copy of each rule.
const fontFaces = () => [...new Set(files.flatMap(({ text }) => [...text.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => body)))];

test('the build has only latin woff2 font files from the Fontsource packages', () => {
  const latin = new Set(['roboto', 'roboto-mono'].flatMap((pkg) => {
    const dir = join(root, 'node_modules/@fontsource', pkg, 'files');
    return readdirSync(dir).filter((name) => /-latin-\d+-(normal|italic)\.woff2$/.test(name)).map((name) => readFileSync(join(dir, name)).toString('base64'));
  }));
  const fonts = readdirSync(outDir, { recursive: true, encoding: 'utf8' }).filter((name) => /\.(woff2?|ttf|otf|eot)$/.test(name));
  expect(fonts).not.toHaveLength(0);
  for (const name of fonts) expect(latin.has(readFileSync(join(outDir, name)).toString('base64')), name).toBe(true);
});

test.each([
  ['Roboto', ['400 italic', '400 normal', '600 normal', '700 normal']],
  ['Roboto Mono', ['400 normal', '600 normal']],
])('the built pages have @font-face rules for %s in %j with font files on the site', (family, faces) => {
  // Astro adds a hash to the family name, for example Roboto-b55900a43a44a289.
  const rules = fontFaces().filter((body) => new RegExp(`font-family:\\s*["']?${family}-[0-9a-f]+["']?\\s*(;|$)`).test(body));
  expect(rules.map((body) => `${body.match(/font-weight:\s*(\d+)/)?.[1]} ${body.match(/font-style:\s*(\w+)/)?.[1]}`).sort()).toEqual(faces);
  for (const body of rules) {
    const urls = [...body.matchAll(/url\(\s*["']?([^"')]+)/g)].map(([, url]) => url);
    expect(urls, family).not.toHaveLength(0);
    for (const url of urls) expect(existsSync(join(outDir, url)), url.slice(0, 80)).toBe(true);
  }
});

test('the home page has one font preload link, to the Roboto latin 400 normal file', () => {
  const page = files.find(({ name }) => name === 'index.html')!.text;
  const preloads = (page.match(/<link\b[^>]*>/g) ?? []).filter((tag) => /\brel="?preload\b/.test(tag) && /\bas="?font\b/.test(tag));
  // The preload filter in Head.astro has no subset. If the build gets a Roboto 400 normal file of another subset, the page gets a second font preload link, and this test fails.
  expect(preloads).toHaveLength(1);
  const href = preloads[0].match(/\bhref="?([^"\s>]+)/)?.[1] ?? '';
  const roboto400 = readFileSync(join(root, 'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2'));
  expect(readFileSync(join(outDir, href)).equals(roboto400), href).toBe(true);
});

test.each([
  ['--sl-font', '--font-roboto', 'Roboto'],
  ['--sl-font-mono', '--font-roboto-mono', 'Roboto Mono'],
])('%s is var(%s), which holds %s, then a local font with metric overrides', (property, variable, family) => {
  const text = files.map(({ text }) => text).join('\n');
  expect(new RegExp(`${property}:\\s*var\\(${variable}\\)\\s*[;}]`).test(text), property).toBe(true);
  const [font, fallback] = (text.match(new RegExp(`${variable}:([^;}]+)`))?.[1] ?? '').split(',').map((name) => name.trim().replace(/^"|"$/g, ''));
  expect(font).toMatch(new RegExp(`^${family}-[0-9a-f]+$`));
  expect(fallback).toMatch(new RegExp(`^${font} fallback: `));
  const face = fontFaces().find((body) => body.includes(`font-family:"${fallback}"`));
  expect(face).toMatch(/src:\s*local\(/);
  expect(face).toMatch(/ascent-override:/);
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
