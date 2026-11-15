// Fails if a source of a chapter in the arguments does not load (docs/DESIGN.md "Code samples": the link check).
// On a PR, CI gives it the docs files that the PR changes. Run it from site/: node scripts/dead-sources.ts src/content/docs/<file>.md ...
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { deadSources } from '../src/deadSources.ts';
import { chapters } from './chapters.ts';

const files = new Set(process.argv.slice(2).map((file) => resolve(file)));
const given = chapters.filter((chapter) => files.has(chapter.file));
console.log(`The check fetches ${new Set(given.flatMap((chapter) => chapter.sources)).size} sources of ${given.length} chapters.`);
// The default fetch waits 300 s for the headers of a host that does not answer.
const dead = await deadSources(given.flatMap((chapter) => chapter.sources), (url) => fetch(url, { signal: AbortSignal.timeout(30_000) }), setTimeout);
for (const { file, sources } of given) {
  for (const source of sources.filter((s) => dead.has(s))) {
    console.error(`The chapter ${file} has a source that does not load: ${source} (${dead.get(source)}). If the source loads in a browser, run the job again. If the source moved, make a plan amendment with the new URL, and change each citation of the source to the new URL. If the source does not exist, make a plan amendment with a new source, and cite the new source for each claim. A plan amendment is a separate commit that changes only the frontmatter. The maintainer approves it with a "plan approved" comment.`);
  }
}
if (dead.size > 0) process.exitCode = 1;
