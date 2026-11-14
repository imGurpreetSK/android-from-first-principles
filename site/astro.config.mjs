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
        // The code theme uses italic and bold only for Markdown and C# code, so Roboto Mono gets only 400.
        '@fontsource/roboto/400.css',
        '@fontsource/roboto/400-italic.css',
        '@fontsource/roboto/600.css',
        '@fontsource/roboto/700.css',
        '@fontsource/roboto-mono/400.css',
        './src/styles/theme.css',
      ],
    }),
  ],
});
