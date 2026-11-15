import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// This fixture is a separate root, so the built site does not get its pages.
export default defineConfig({ integrations: [starlight({ title: 'Go deeper box' })] });
