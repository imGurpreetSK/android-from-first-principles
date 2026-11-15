import { z } from 'astro/zod';
import { source } from './citations';
import { sections } from './sections';

// The checked stamp, for example { android: 17, aosp: 'android-17.0.0_r1' }.
const checked = z
  .object({
    android: z.number().int().min(10),
    aosp: z.string().regex(/^android-\d+\.\d+\.\d+_r\d+$/),
    // A library version is a string, because YAML reads an unquoted 2.10 as the number 2.1.
    libraries: z.record(z.string(), z.string()).default({}),
    play_services: z.string().optional(),
    emulator: z
      .object({ image: z.string().regex(/^system-images;[^;]+;[^;]+;[^;]+$/), revision: z.number().int().min(1) })
      .optional(),
  })
  .refine((c) => c.aosp.startsWith(`android-${c.android}.`), { path: ['aosp'], message: 'aosp must be a tag of the android release.' });

// docs/DESIGN.md "Chapter shape" and "Sourcing rules" give the chapter fields. Starlight gives `title` and `sidebar.order`.
const chapter = {
  section: z.enum(sections.map((s) => s.label)),
  checked,
  // CI removes the anchor and the timestamp from each citation, then needs an exact match with a source (src/citations.ts).
  sources: z.array(z.httpUrl().refine((url) => source(url) === url, 'A source has no anchor or timestamp. Put them in the citation.')).min(1),
  rebuild: z.boolean(),
  device: z.boolean(),
  drafted: z.enum(['ai', 'human']),
  edited_by: z.string().trim().min(1),
};
const keys = Object.keys(chapter) as (keyof typeof chapter)[];

export const frontmatter = z
  .object(chapter)
  .partial()
  .superRefine((data, ctx) => {
    const missing = keys.filter((key) => data[key] === undefined);
    // A page without chapter fields is not a chapter, for example the home page.
    if (missing.length === keys.length) return;
    for (const key of missing) {
      ctx.addIssue({ code: 'custom', path: [key], message: 'A chapter must have this field.' });
    }
    // Starlight makes sidebar.order optional. docsSchema merges this schema with the Starlight schema, so data has sidebar.
    // Without sidebar.order, the sidebar sorts the chapters of a section by id. Then the display numbers follow the alphabet.
    if ((data as { sidebar?: { order?: number } }).sidebar?.order === undefined) {
      ctx.addIssue({ code: 'custom', path: ['sidebar', 'order'], message: 'A chapter must have this field. Write order under sidebar, as in docs/DESIGN.md "Chapter shape".' });
    }
    const { device, checked } = data;
    if (device === true && !checked?.emulator) {
      ctx.addIssue({ code: 'custom', path: ['checked', 'emulator'], message: 'If device is true, checked must have the emulator.' });
    }
    if (device === false && checked?.emulator) {
      ctx.addIssue({ code: 'custom', path: ['checked', 'emulator'], message: 'If device is false, checked must not have the emulator.' });
    }
  });
