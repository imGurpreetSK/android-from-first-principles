import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // build.test.ts and fonts.test.ts each run astro build on the site. Two builds at the same time share site/.astro/ and node_modules/.astro/, so one build can fail.
    fileParallelism: false,
  },
});
