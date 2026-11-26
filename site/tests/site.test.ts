import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { sections } from '../src/sections';
import { build } from './astro';

const root = fileURLToPath(new URL('..', import.meta.url));
// A separate output directory, so the test does not change dist/.
const outDir = mkdtempSync(join(tmpdir(), 'afp-site-'));
// The build has the home page, the About page, the chapter pages and the Starlight 404 page. Each page loads the custom CSS.
let files: { name: string; text: string }[] = [];

beforeAll(() => {
  const { status, stdout, stderr } = build('--root', root, '--outDir', outDir);
  expect(status, stdout + stderr).toBe(0);
  files = readdirSync(outDir, { recursive: true, encoding: 'utf8' })
    .filter((name) => /\.(html|css)$/.test(name))
    .map((name) => ({ name, text: readFileSync(join(outDir, name), 'utf8') }));
}, 60_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

test('astro build makes a home page with the page title, the hero title and the tagline', () => {
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  expect(html).toContain('<title>Android from First Principles</title>');
  // Without a hero, Starlight also renders the page title as an h1. Thus look for the h1 and the tagline in the hero.
  expect(html).toMatch(/<div class="hero[ "][^>]*>[\s\S]*?<h1[^>]*>Android from First Principles<\/h1>[\s\S]*?<div class="tagline[ "][^>]*>The machinery under Android app development\.<\/div>/);
});

// The sidebar of the About page: each section with a published chapter, and the links of its chapters, in section and sidebar order.
// Each group label has the class "large". The sidebar has no nested group.
const sidebar = () =>
  readFileSync(join(outDir, 'about/index.html'), 'utf8')
    .match(/<nav\b[^>]*\baria-label="Main"[^>]*>[\s\S]*?<\/nav>/)![0]
    .split(/<span class="large[ "][^>]*>/)
    .slice(1)
    .map((group) => ({ section: group.slice(0, group.indexOf('<')), links: [...group.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map(([, href]) => href) }));

test('the hero links "Start reading" to the first chapter in the sidebar and "About" to the About page, and each link has a page', () => {
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  const actions = html.match(/<div class="(?:[^"]* )?actions[ "][^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
  const links = [...actions.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([^<]*)<\/a>/g)].map(([, href, text]) => [text, href]);
  expect(links).toEqual([
    ['Start reading', sidebar()[0].links[0]],
    ['About', '/about/'],
  ]);
  for (const [, href] of links) expect(existsSync(join(outDir, href, 'index.html')), href).toBe(true);
});

test('the home page lists each chapter page of the build under the heading of its section, in the order of the sidebar, with the title of the page', () => {
  const content = readFileSync(join(outDir, 'index.html'), 'utf8').match(/<div class="(?:[^"]* )?sl-markdown-content[ "][^>]*>([\s\S]*?)<footer\b/)?.[1] ?? '';
  const home = content
    .split(/<h2\b[^>]*>/)
    .slice(1)
    .map((part) => ({ section: part.slice(0, part.indexOf('<')), links: [...part.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([^<]*)<\/a>/g)].map(([, href, text]) => ({ href, text })) }));
  expect(home.map(({ section, links }) => ({ section, links: links.map(({ href }) => href) }))).toEqual(sidebar());
  // The pages in the directory of a section. The id of a chapter is <section-slug>/<chapter-slug> (src/sections.ts).
  const pages = readdirSync(outDir, { recursive: true, encoding: 'utf8' })
    .filter((name) => sections.some((s) => name.startsWith(`${s.slug}/`)) && name.endsWith('/index.html'))
    .map((name) => `/${name.slice(0, -'index.html'.length)}`);
  const links = home.flatMap((s) => s.links);
  expect(pages).not.toHaveLength(0);
  expect(links.map(({ href }) => href).sort()).toEqual(pages.sort());
  for (const { href, text } of links) {
    expect(readFileSync(join(outDir, href, 'index.html'), 'utf8').match(/<h1 id="_top"[^>]*>([^<]*)<\/h1>/)?.[1], href).toBe(text);
  }
});

test('astro build makes an About page with each sentence of the AI disclosure in docs/DESIGN.md', () => {
  // The disclosure is the nested list in the "AI disclosure" section of docs/DESIGN.md.
  const section = readFileSync(new URL('../../docs/DESIGN.md', import.meta.url), 'utf8').match(/^## AI disclosure\n([\s\S]*?)^## /m)![1];
  const sentences = [...section.matchAll(/^  - (.+)$/gm)].map(([, sentence]) => sentence);
  expect(sentences).not.toHaveLength(0);
  const main = readFileSync(join(outDir, 'about/index.html'), 'utf8').match(/<main[\s\S]*<\/main>/)![0];
  for (const sentence of sentences) expect(main.includes(sentence), sentence).toBe(true);
});

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
