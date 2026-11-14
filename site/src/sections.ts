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
// A chapter is an entry with a section. Its URL must be /<section slug>/<chapter slug>/.
// The chapter slug must be unique across the series, because the progress key and the samples/ module use it.
export function checkChapters(entries: { id: string; data: Record<string, unknown>; filePath?: string }[]) {
  const idBySlug = new Map<string, string>();
  for (const { id, data, filePath } of entries) {
    const section = sections.find((s) => s.label === data.section);
    if (!section) continue;
    const [first, slug, ...rest] = id.split('/');
    // A slug field changes the id. Thus also check that the file is in the directory of its section.
    const directory = filePath?.split('/').at(-2);
    if (first !== section.slug || !slug || rest.length > 0 || directory !== section.slug) {
      throw new Error(`The chapter ${filePath} has the section "${section.label}". Put the file in src/content/docs/${section.slug}/, not in a subdirectory, and remove a slug field. Then the URL is /${section.slug}/<chapter slug>/.`);
    }
    const other = idBySlug.get(slug);
    if (other) {
      throw new Error(`The chapters /${other}/ and /${id}/ have the same chapter slug "${slug}". Each chapter slug must be unique across the series.`);
    }
    idBySlug.set(slug, id);
  }
}
