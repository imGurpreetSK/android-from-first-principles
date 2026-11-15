// The weekly source check (docs/DESIGN.md "Code samples": the link check). It fetches the sources of all chapters, and reports in one GitHub issue each source that does not load.
// .github/workflows/weekly-source-check.yml runs it from site/. It runs gh, which reads the token from GH_TOKEN and the repo from GH_REPO.
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { deadSources, reportDeadSources } from '../src/deadSources.ts';
import { chapters } from './chapters.ts';

const sources = chapters.flatMap((chapter) => chapter.sources);
console.log(`The check fetches ${new Set(sources).size} sources of ${chapters.length} chapters.`);
// The default fetch waits 300 s for the headers of a host that does not answer.
const dead = await deadSources(sources, (url) => fetch(url, { signal: AbortSignal.timeout(30_000) }), setTimeout);
console.log(`${dead.size} sources do not load.`);

const root = fileURLToPath(new URL('../../', import.meta.url));
const gh = (...args: string[]) => execFileSync('gh', args, { encoding: 'utf8' });
reportDeadSources(dead, chapters.map(({ file, sources }) => ({ file: relative(root, file), sources })), {
  // shortcut: gh reads at most 1000 open issues. If the repo has more open issues, add --search with the title.
  open: () => JSON.parse(gh('issue', 'list', '--state', 'open', '--limit', '1000', '--json', 'number,title')),
  create: (title, body) => gh('issue', 'create', '--title', title, '--body', body),
  edit: (number, body) => gh('issue', 'edit', String(number), '--body', body),
  close: (number, comment) => gh('issue', 'close', String(number), '--comment', comment),
});
