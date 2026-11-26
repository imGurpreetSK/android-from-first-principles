import { getCollection } from 'astro:content';

// The chapters on the site. A chapter is an entry with a section. Starlight does not build a draft page in production.
export const getChapters = () =>
  getCollection('docs', ({ data }) => data.section !== undefined && (import.meta.env.MODE !== 'production' || !data.draft));
