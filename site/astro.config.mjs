import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sections } from './src/sections.ts';

// Starlight resolves a path that starts with "." against the Astro root. A test fixture has its own root, so give absolute paths.
const local = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Fail the build if two docs files have the same id, for example main-thread.md and main-thread.mdx in one section directory. The default only warns, and one file replaces the other.
  prerenderConflictBehavior: 'error',
  integrations: [
    starlight({
      title: 'Android from First Principles',
      editLink: {
        baseUrl: 'https://github.com/imGurpreetSK/android-from-first-principles/edit/main/site/',
      },
      // One group for each section, in the order of the curriculum. The chapters of a group are the files in the directory of its section.
      sidebar: sections.map((s) => ({ label: s.label, items: [{ autogenerate: { directory: s.slug } }] })),
      routeMiddleware: local('./src/routeData.ts'),
      customCss: [
        // Only the font files that the site uses: 400 and 400 italic for text, 600 for headings and labels, 700 for bold text.
        // The Night Owl code themes use italic only for the italic and Markdown italic scopes.
        // They use bold only for the bold, Markdown bold and C# region scopes. So code blocks need no Roboto Mono italic or bold.
        // Inline code inside headings, table headers and summary gets weight 600.
        '@fontsource/roboto/400.css',
        '@fontsource/roboto/400-italic.css',
        '@fontsource/roboto/600.css',
        '@fontsource/roboto/700.css',
        '@fontsource/roboto-mono/400.css',
        '@fontsource/roboto-mono/600.css',
        local('./src/styles/theme.css'),
      ],
      components: {
        MarkdownContent: local('./src/components/MarkdownContent.astro'),
        Footer: local('./src/components/Footer.astro'),
        LastUpdated: local('./src/components/LastUpdated.astro'),
      },
    }),
  ],
});
