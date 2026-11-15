import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sections } from './src/sections.ts';

// Starlight resolves a path that starts with "." against the Astro root. A test fixture has its own root, so give absolute paths.
const local = (path) => fileURLToPath(new URL(path, import.meta.url));

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
  ],
});
