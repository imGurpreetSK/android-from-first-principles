// Fails if a source of a chapter in the arguments does not load (docs/DESIGN.md "Code samples": the link check).
// On a PR, CI gives it the docs files that the PR changes. Run it from site/: node scripts/dead-sources.ts src/content/docs/<file>.md ...
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { deadSources } from '../src/deadSources.ts';
import { chapters } from './chapters.ts';

const files = new Set(process.argv.slice(2).map((file) => resolve(file)));
const given = chapters.filter((chapter) => files.has(chapter.file));
const dead = await deadSources(given.flatMap((chapter) => chapter.sources), fetch, setTimeout);
for (const { file, sources } of given) {
  for (const source of sources.filter((s) => dead.has(s))) {
    console.error(`The chapter ${file} has a source that does not load: ${source} (${dead.get(source)}). If the page moved, change the source and its citations to the new URL. If the page does not exist, remove the source and its citations. If the page loads in a browser, run the job again.`);
  }
}
if (dead.size > 0) process.exitCode = 1;
