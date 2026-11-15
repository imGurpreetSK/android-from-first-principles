// The file and the sources of each docs file. The CI scripts that check sources read them from here.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from 'astro/markdown';

const docs = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
// The files that the Starlight docs loader reads: these extensions, and no file name that starts with _.
export const chapters = readdirSync(docs, { recursive: true, encoding: 'utf8' })
  .filter((file) => /(^|\/)[^_/][^/]*\.(markdown|mdown|mkdn|mkd|mdwn|md|mdx)$/.test(file))
  .map((file) => {
    const { sources } = parseFrontmatter(readFileSync(join(docs, file), 'utf8')).frontmatter;
    return { file: join(docs, file), sources: Array.isArray(sources) ? (sources as string[]) : [] };
  });
