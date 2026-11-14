import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Android from First Principles',
      editLink: {
        baseUrl: 'https://github.com/imGurpreetSK/android-from-first-principles/edit/main/site/',
      },
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
        './src/styles/theme.css',
      ],
    }),
  ],
});
