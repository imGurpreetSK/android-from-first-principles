import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// This fixture is a separate root, so the built site does not get its pages.
// Starlight resolves the customCss paths of the site config from the root, so this fixture has its own config.
export default defineConfig({ integrations: [starlight({ title: 'Go deeper box' })] });
