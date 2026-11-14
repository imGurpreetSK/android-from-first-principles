// A separate root, so the built site does not get the fixture page.
// Not the site config: Starlight resolves its customCss paths against this root.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({ integrations: [starlight({ title: 'Snippet fixture' })] });
