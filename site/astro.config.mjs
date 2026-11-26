import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import astroMermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';
import { missingSource } from './src/citations.ts';
import { sections } from './src/sections.ts';

// Starlight resolves a path that starts with "." against the Astro root. A test fixture has its own root, so give absolute paths.
const local = (path) => fileURLToPath(new URL(path, import.meta.url));

// Fail the build if a link in a chapter body cites no entry in the sources of the chapter. A page without sources is not a chapter.
// Sätteri calls this plugin factory one time for each .md and .mdx file. Astro puts the frontmatter in data.astro.
function citations({ data, fileURL }) {
  const sources = data.astro?.frontmatter?.sources;
  if (!sources) return null;
  const missing = [];
  const check = ({ url }) => {
    if (missingSource(url, sources)) missing.push(url);
  };
  // A reference link gets its URL from a definition node. An image reference also uses a definition node, so check only the definitions of reference links.
  const definitions = [];
  const references = new Set();
  // A JSX element, for example <a> or LinkCard, gives its URL in the href attribute.
  // An href in braces is an expression. The check cannot read its URL, so a chapter must give each href as a string.
  const jsx = ({ attributes }) => {
    for (const a of attributes) {
      if (a.name !== 'href') continue;
      if (typeof a.value === 'string') check({ url: a.value });
      else missing.push('href={…}');
    }
  };
  return {
    name: 'citations',
    link: check,
    linkReference: ({ identifier }) => {
      references.add(identifier);
    },
    definition: (node) => {
      definitions.push(node);
    },
    // In a .md file, an HTML tag is an html node, for example <a href="https://...">. The check reads each href attribute of the node.
    html: ({ value }) => {
      for (const [, url] of value.matchAll(/\shref\s*=\s*["']?([^"'\s>]+)/gi)) check({ url });
    },
    mdxJsxFlowElement: jsx,
    mdxJsxTextElement: jsx,
    // After the visit, so that the error names each link of the chapter that cites no source.
    after() {
      // A definition can come before or after its reference link, so check the definitions after the visit.
      for (const d of definitions) if (references.has(d.identifier)) check(d);
      if (missing.length > 0) {
        throw new Error(`The chapter ${fileURLToPath(fileURL)} has links that cite no entry in its sources field: ${missing.join(', ')}. The check removes the anchor and the timestamp from each external link. Then each external link must be equal to an entry in sources. Change each link to cite a source, or add its target to sources in a plan amendment (docs/DESIGN.md "Chapter pipeline").`);
      }
    },
  };
}

export default defineConfig({
  // Fail the build if two docs files have the same id, for example main-thread.md and main-thread.mdx in one section directory. The default only warns, and one file replaces the other.
  prerenderConflictBehavior: 'error',
  // Each variant is the latin woff2 file of a Fontsource package. Astro reads the file from node_modules and copies it into the build.
  // Use the local provider. The npm provider of Astro 7.4.4 (unifont 1.0.3) does not filter subsets. With remote: false, the build cannot fetch its file: URLs.
  // The fontsource provider gets the file URLs from the Fontsource API during each build, so the build needs the network.
  // For each family, Astro adds fallback faces with the metrics of the font, so the font swap moves less text. optimizedFallbacks is true by default.
  // Only the font files that the site uses: 400 and 400 italic for text, 600 for headings and labels, 700 for bold text.
  // The Night Owl code themes use italic only for the italic and Markdown italic scopes.
  // They use bold only for the bold, Markdown bold and C# region scopes. So code blocks need no Roboto Mono italic or bold.
  // Inline code inside headings, table headers and summary gets weight 600.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Roboto',
      cssVariable: '--font-roboto',
      options: {
        variants: [
          { src: ['@fontsource/roboto/files/roboto-latin-400-normal.woff2'], weight: 400, style: 'normal' },
          { src: ['@fontsource/roboto/files/roboto-latin-400-italic.woff2'], weight: 400, style: 'italic' },
          { src: ['@fontsource/roboto/files/roboto-latin-600-normal.woff2'], weight: 600, style: 'normal' },
          { src: ['@fontsource/roboto/files/roboto-latin-700-normal.woff2'], weight: 700, style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Roboto Mono',
      cssVariable: '--font-roboto-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          { src: ['@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2'], weight: 400, style: 'normal' },
          { src: ['@fontsource/roboto-mono/files/roboto-mono-latin-600-normal.woff2'], weight: 600, style: 'normal' },
        ],
      },
    },
  ],
  integrations: [
    // A Sätteri plugin of astro-mermaid changes each mermaid code block to <pre class="mermaid">, so Expressive Code does not show it as code.
    // A page script loads the mermaid package only on a page with a diagram. The script renders each diagram in the theme of the page, and renders it again when the theme changes.
    // The astro-mermaid README puts it before Starlight.
    // astro-mermaid imports @astrojs/markdown-satteri, the processor package of astro. If the import fails, astro-mermaid logs a warning and adds remark and rehype plugins. The site does not install @astrojs/markdown-remark, so astro build fails.
    // enableLog: false keeps the info logs of the script out of the browser console.
    // The default layout of mermaid 12.3.0 is ELK. Its chunk adds about 457 KB gzip to each page with a diagram, so use dagre.
    // A flowchart label wraps at 120 px by default, so a long Android class name, for example ActivityTaskManager, breaks in the word.
    astroMermaid({ enableLog: false, mermaidConfig: { layout: 'dagre', flowchart: { wrappingWidth: 200 } } }),
    starlight({
      title: 'Android from First Principles',
      editLink: {
        baseUrl: 'https://github.com/imGurpreetSK/android-from-first-principles/edit/main/site/',
      },
      // One group for each section, in the order of the curriculum. The chapters of a group are the files in the directory of its section.
      sidebar: sections.map((s) => ({ label: s.label, items: [{ autogenerate: { directory: s.slug } }] })),
      routeMiddleware: local('./src/routeData.ts'),
      customCss: [local('./src/styles/theme.css')],
      components: {
        Head: local('./src/components/Head.astro'),
        MarkdownContent: local('./src/components/MarkdownContent.astro'),
        Footer: local('./src/components/Footer.astro'),
        LastUpdated: local('./src/components/LastUpdated.astro'),
      },
    }),
    // Astro 7 renders .md and .mdx files with its default Sätteri processor. Add the check to that processor, as Starlight adds its plugins. So package.json needs no copy of @astrojs/markdown-satteri.
    { name: 'citations', hooks: { 'astro:config:setup': ({ config }) => void config.markdown.processor.options.mdastPlugins.push(citations) } },
  ],
});
