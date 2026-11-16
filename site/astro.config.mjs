import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';
import { missingSource, needsSource } from './src/citations.ts';
import { sections } from './src/sections.ts';

// Starlight resolves a path that starts with "." against the Astro root. A test fixture has its own root, so give absolute paths.
const local = (path) => fileURLToPath(new URL(path, import.meta.url));

// Fail the build if a link in a chapter body cites no entry in the sources of the chapter, or if a citation is not in the footnote form (docs/DESIGN.md "Sourcing rules"). A page without sources is not a chapter.
// Sätteri calls this plugin factory one time for each .md and .mdx file. Astro puts the frontmatter in data.astro.
function citations({ data, fileURL }) {
  const sources = data.astro?.frontmatter?.sources;
  if (!sources) return null;
  const missing = [];
  // The links that must cite a source, but are outside a footnote definition, or are a reference link, an HTML link or a JSX link.
  const outside = [];
  // The links in a footnote definition whose text is not their URL.
  const wrongText = [];
  const check = ({ url }) => {
    if (missingSource(url, sources)) missing.push(url);
  };
  const inline = ({ url }) => {
    check({ url });
    if (needsSource(url)) outside.push(url);
  };
  const inFootnote = (node, ctx) => {
    for (let p = ctx.parent(node); p; p = ctx.parent(p)) if (p.type === 'footnoteDefinition') return true;
    return false;
  };
  // A reference link gets its URL from a definition node. An image reference also uses a definition node, so check only the definitions of reference links.
  const definitions = [];
  const references = new Set();
  // A JSX element, for example <a> or LinkCard, gives its URL in the href attribute.
  // An href in braces is an expression. The check cannot read its URL, so a chapter must give each href as a string.
  const jsx = ({ attributes }) => {
    for (const a of attributes) {
      if (a.name !== 'href') continue;
      if (typeof a.value === 'string') inline({ url: a.value });
      else missing.push('href={…}');
    }
  };
  return {
    name: 'citations',
    link: (node, ctx) => {
      if (!inFootnote(node, ctx)) inline(node);
      else {
        check(node);
        if (ctx.textContent(node) !== node.url) wrongText.push(node.url);
      }
    },
    linkReference: ({ identifier }) => {
      references.add(identifier);
    },
    definition: (node) => {
      definitions.push(node);
    },
    // In a .md file, an HTML tag is an html node, for example <a href="https://...">. The check reads each href attribute of the node.
    html: ({ value }) => {
      for (const [, url] of value.matchAll(/\shref\s*=\s*["']?([^"'\s>]+)/gi)) inline({ url });
    },
    mdxJsxFlowElement: jsx,
    mdxJsxTextElement: jsx,
    // After the visit, so that the error names each bad link of the chapter.
    after() {
      // A definition can come before or after its reference link, so check the definitions after the visit.
      for (const d of definitions) if (references.has(d.identifier)) inline(d);
      const file = fileURLToPath(fileURL);
      const errors = [];
      if (missing.length > 0) {
        errors.push(`The chapter ${file} has links that cite no entry in its sources field: ${missing.join(', ')}. The check removes the anchor and the timestamp from each external link. Then each external link must be equal to an entry in sources. Change each link to cite a source, or add its target to sources in a plan amendment (docs/DESIGN.md "Chapter pipeline").`);
      }
      if (outside.length > 0) {
        errors.push(`The chapter ${file} has external links that are not a link of the form [<text>](<URL>) in a footnote: ${outside.join(', ')}. Write each citation as a GFM footnote. Put the marker [^<label>] after the claim. At the end of the file, put the definition [^<label>]: <short label>: [<URL>](<URL>) (docs/DESIGN.md "Sourcing rules").`);
      }
      if (wrongText.length > 0) {
        errors.push(`The chapter ${file} has footnote links whose text is not their URL: ${wrongText.join(', ')}. Make the text of each link equal to its URL, with the anchor, so that the footnote shows the URL.`);
      }
      if (errors.length > 0) throw new Error(errors.join(' '));
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
    // Sätteri names the footnotes section "Footnotes" by default. The aria-describedby attribute of each marker points to its hidden heading, and the table of contents links to the heading.
    // Sätteri labels each back link "Back to reference {reference}" by default. CONTEXT.md avoids "reference" for a citation.
    // A gfm object keeps the other GFM features on (featuresToParseOptions in satteri/dist/compile.js).
    {
      name: 'citations',
      hooks: {
        'astro:config:setup': ({ config }) => {
          const { options } = config.markdown.processor;
          options.mdastPlugins.push(citations);
          options.features.gfm = { footnotes: { label: 'Citations', backLabel: 'Back to citation {reference}' } };
        },
      },
    },
  ],
});
