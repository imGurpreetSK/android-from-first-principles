// This fixture is a separate Astro root, so the built site does not get the fixture page.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({ integrations: [starlight({ title: 'Snippet fixture' })] });
