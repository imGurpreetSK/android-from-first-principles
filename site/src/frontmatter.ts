import { z } from 'astro/zod';

// The baseline release and its AOSP tag, for example "Android 17 (AOSP android-17.0.0_r1)".
const BASELINE = /^Android .+ \(AOSP android-\S+\)/;
// The emulator system image and its revision, for example "system-images;android-37.0;google_apis;arm64-v8a, revision 8".
const EMULATOR = /system-images;[^;,\s]+;[^;,\s]+;[^;,\s]+, revision \d+/;

// docs/DESIGN.md "Chapter shape" and "Sourcing rules" give the chapter fields. Starlight gives `title`.
const chapter = {
  section: z.string().min(1),
  checked: z.string().regex(BASELINE),
  sources: z.array(z.httpUrl()).min(1),
  rebuild: z.boolean(),
  device: z.boolean(),
  drafted: z.enum(['ai', 'human']),
  edited_by: z.string().min(1),
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
    const { device, checked = '' } = data;
    if (device === true && !EMULATOR.test(checked)) {
      ctx.addIssue({ code: 'custom', path: ['checked'], message: 'If device is true, checked must name the emulator system image and its revision.' });
    }
    if (device === false && checked.includes('system-images;')) {
      ctx.addIssue({ code: 'custom', path: ['checked'], message: 'If device is false, checked must not name an emulator system image.' });
    }
  });
