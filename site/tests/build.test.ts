import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
const site = fileURLToPath(new URL('..', import.meta.url));
// A separate Astro root, so the built site does not get a page for the fixture.
const fixture = fileURLToPath(new URL('./fixtures/invalid-chapter', import.meta.url));

test('astro build makes a home page with the page title, the hero title and the tagline', () => {
  const { status, stderr } = spawnSync(astro, ['build', '--root', site], { encoding: 'utf8', timeout: 60_000 });
  expect(status, stderr).toBe(0);
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  expect(html).toContain('<title>Android from First Principles</title>');
  // Without a hero, Starlight also renders the page title as an h1. Thus look for the h1 and the tagline in the hero.
  expect(html).toMatch(/<div class="hero[ "][^>]*>[\s\S]*?<h1[^>]*>Android from First Principles<\/h1>[\s\S]*?<div class="tagline[ "][^>]*>The machinery under Android app development\.<\/div>/);
}, 60_000);

test('astro build makes an About page with each sentence of the AI disclosure in docs/DESIGN.md', () => {
  const { status, stderr } = spawnSync(astro, ['build', '--root', site], { encoding: 'utf8', timeout: 60_000 });
  expect(status, stderr).toBe(0);
  // The disclosure is the nested list in the "AI disclosure" section of docs/DESIGN.md.
  const section = readFileSync(new URL('../../docs/DESIGN.md', import.meta.url), 'utf8').match(/^## AI disclosure\n([\s\S]*?)^## /m)![1];
  const sentences = [...section.matchAll(/^  - (.+)$/gm)].map(([, sentence]) => sentence);
  expect(sentences).not.toHaveLength(0);
  const main = readFileSync(new URL('../dist/about/index.html', import.meta.url), 'utf8').match(/<main[\s\S]*<\/main>/)![0];
  for (const sentence of sentences) expect(main.includes(sentence), sentence).toBe(true);
}, 60_000);

test('astro build fails on a chapter with invalid frontmatter', () => {
  // --force clears the content cache, so the build checks the fixture with the current schema.
  // spawnSync blocks the thread, so the test timeout cannot stop a stuck build. The spawnSync timeout stops it.
  const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', fixture, '--force'], { encoding: 'utf8', timeout: 60_000 });
  expect(status).not.toBe(0);
  expect(stdout + stderr).toMatch(/InvalidContentEntryDataError[\s\S]*drafted/);
}, 60_000);
