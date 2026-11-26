// docs/DESIGN.md "Curriculum" gives the sections and their order.
// The slug of a section is the first segment of the URL of each of its chapters, for example /launch-path/main-thread/.
export const sections = [
  { label: 'The Launch Path', slug: 'launch-path' },
  { label: 'State & Survival', slug: 'state-survival' },
  { label: 'Concurrency', slug: 'concurrency' },
  { label: 'UI Machinery', slug: 'ui-machinery' },
  { label: 'Data & I/O', slug: 'data-io' },
  { label: 'Production', slug: 'production' },
  { label: 'Beyond One Platform', slug: 'beyond-one-platform' },
] as const;

// The id of a chapter is its URL without the slashes at the start and the end. The path of the file sets the id, if the frontmatter has no slug field.
// A chapter is an entry with a section. Its URL must be /<section-slug>/<chapter-slug>/.
// The chapter slug must be unique across the series, because the progress key and the samples/ module use it.
export function checkChapters(entries: { id: string; data: Record<string, unknown>; filePath?: string }[]) {
  const idBySlug = new Map<string, string>();
  const idByOrder = new Map<string, string>();
  for (const { id, data, filePath } of entries) {
    const section = sections.find((s) => s.label === data.section);
    if (!section) {
      // The sidebar shows and numbers each page in the directory of a section. Thus each of these pages must be a chapter.
      if (sections.some((s) => filePath?.startsWith(`src/content/docs/${s.slug}/`))) {
        throw new Error(`The page ${filePath} is in the directory of a section, but it is not a chapter. Give it all the chapter fields, or move the file out of the directory.`);
      }
      continue;
    }
    const [first, slug, ...rest] = id.split('/');
    // A slug field changes the id. Thus also check that the file is in the directory of its section.
    const directory = filePath?.split('/').at(-2);
    if (first !== section.slug || !slug || rest.length > 0 || directory !== section.slug) {
      throw new Error(`The chapter ${filePath} has the section "${section.label}". Put the file in src/content/docs/${section.slug}/, not in a subdirectory. If the frontmatter has a slug field, remove it. Then the URL is /${section.slug}/<chapter-slug>/.`);
    }
    const other = idBySlug.get(slug);
    if (other) {
      throw new Error(`The chapters /${other}/ and /${id}/ have the same chapter slug "${slug}". Each chapter slug must be unique across the series.`);
    }
    idBySlug.set(slug, id);
    // Starlight sorts the chapters with the same sidebar.order by id. Then the display numbers follow the alphabet.
    const order = (data.sidebar as { order?: number } | undefined)?.order;
    // The frontmatter schema reports a chapter without sidebar.order.
    if (order === undefined) continue;
    const before = idByOrder.get(`${section.slug}/${order}`);
    if (before) {
      throw new Error(`The chapters /${before}/ and /${id}/ have the same sidebar.order ${order} in the section "${section.label}". Set sidebar.order to the position of each chapter in its section.`);
    }
    idByOrder.set(`${section.slug}/${order}`, id);
  }
}

// Returns each section that has a chapter, with its chapters. The sections are in the order of the curriculum, and the chapters of a section are in sidebar order, as in the sidebar.
// The frontmatter schema requires sidebar.order for a chapter. checkChapters rejects two chapters with the same sidebar.order in one section.
export function bySection<T extends { data: { section?: string; sidebar: { order?: number } } }>(chapters: T[]) {
  return sections
    .map(({ label }) => ({ label, chapters: chapters.filter((c) => c.data.section === label).sort((a, b) => a.data.sidebar.order! - b.data.sidebar.order!) }))
    .filter((s) => s.chapters.length > 0);
}
