import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const astro = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
// A separate Astro root, so the built site does not get a page for the fixture.
const fixture = fileURLToPath(new URL('./fixtures/invalid-chapter', import.meta.url));

test('astro build fails on a chapter with invalid frontmatter', () => {
  // --force clears the content cache, so the build checks the fixture with the current schema.
  // spawnSync blocks the thread, so the test timeout cannot stop a stuck build. The spawnSync timeout stops it.
  const { status, stdout, stderr } = spawnSync(astro, ['build', '--root', fixture, '--force'], { encoding: 'utf8', timeout: 60_000 });
  expect(status).not.toBe(0);
  expect(stdout + stderr).toMatch(/InvalidContentEntryDataError[\s\S]*drafted/);
}, 60_000);
