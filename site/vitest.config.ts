import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // site.test.ts builds the site. build.test.ts and chapter.test.ts build fixtures. If the output directory of a build is outside the working directory, site/, Astro writes the prerender files into site/.astro/.prerender/ and deletes that directory at the end of the build. Two builds at the same time share that directory, so one build can fail.
    fileParallelism: false,
  },
});
