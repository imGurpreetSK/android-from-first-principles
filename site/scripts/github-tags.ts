// Fails if a GitHub source of a chapter points to a ref that is not a full commit SHA and not a tag (docs/DESIGN.md "Sourcing rules").
// The check needs the network, so astro build does not run it. CI runs it in a separate step. Run it from site/: node scripts/github-tags.ts
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from 'astro/markdown';
import { unpinned } from '../src/codeLinks.ts';

const docs = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
// The files that the Starlight docs loader reads: these extensions, and no file name that starts with _.
const chapters = readdirSync(docs, { recursive: true, encoding: 'utf8' })
  .filter((file) => /(^|\/)[^_/][^/]*\.(markdown|mdown|mkdn|mkd|mdwn|md|mdx)$/.test(file))
  .map((file) => {
    const { sources } = parseFrontmatter(readFileSync(join(docs, file), 'utf8')).frontmatter;
    return { file: join(docs, file), sources: Array.isArray(sources) ? (sources as string[]) : [] };
  });

// With GIT_TERMINAL_PROMPT=0, git fails on a repo that does not exist. It does not ask for a user name.
// The tag list of a large repo is larger than the default buffer of 1 MiB. For example, JetBrains/kotlin has about 7 MB.
const lsRemote = (repo: string) =>
  execFileSync('git', ['ls-remote', '--tags', repo], { encoding: 'utf8', timeout: 60_000, maxBuffer: 64 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });

const bad = new Set(unpinned(chapters.flatMap((chapter) => chapter.sources), lsRemote));
for (const { file, sources } of chapters) {
  for (const source of sources.filter((s) => bad.has(s))) {
    console.error(`The chapter ${file} has a GitHub source with a ref that is not a full commit SHA and not a tag: ${source}. A branch moves. Pin the link to a tag or to a full 40-character commit SHA.`);
  }
}
if (bad.size > 0) process.exitCode = 1;
