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
