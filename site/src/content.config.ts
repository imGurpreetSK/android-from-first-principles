import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { frontmatter } from './frontmatter';
import { checkChapters } from './sections';

const docs = docsLoader();

export const collections = {
  docs: defineCollection({
    // The Starlight loader, then a check of the URL and the chapter slug of each chapter. If the check fails, the build fails.
    loader: {
      ...docs,
      load: async (context) => {
        await docs.load(context);
        checkChapters([...context.store.values()]);
      },
    },
    schema: docsSchema({ extend: frontmatter }),
  }),
};
