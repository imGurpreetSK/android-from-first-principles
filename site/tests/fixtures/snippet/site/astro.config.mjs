// This fixture is a separate Astro root, so the built site does not get the fixture page.
// This fixture does not use the site config. Starlight resolves each customCss path that starts with "." against the Astro root, and this root has no src/styles/theme.css.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({ integrations: [starlight({ title: 'Snippet fixture' })] });
