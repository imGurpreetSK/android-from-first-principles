// The progress tracker of the reader (docs/DESIGN.md, "Site").
// The key of a chapter is read:<chapter-slug>, not its URL, because a chapter can move to another section (docs/DESIGN.md, "Curriculum").
// Each storage access can throw, for example if the browser blocks storage. Then these functions return undefined.

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
// read: the reader marked the chapter as read. count: the number of chapters on the site that the reader marked as read.
export type Progress = { read: boolean; count: number };

const key = (slug: string) => `read:${slug}`;

// slugs: the chapter slugs of all chapters on the site. slug: the chapter slug of this page.
export function progress(storage: () => Store, slugs: string[], slug: string): Progress | undefined {
  try {
    const s = storage();
    const read = (x: string) => s.getItem(key(x)) !== null;
    return { read: read(slug), count: slugs.filter(read).length };
  } catch {
    return undefined;
  }
}

// Marks the chapter as read. If the reader marked it as read before, marks it as not read. Then returns the new progress.
export function toggle(storage: () => Store, slugs: string[], slug: string): Progress | undefined {
  try {
    const s = storage();
    if (s.getItem(key(slug)) === null) s.setItem(key(slug), '1');
    else s.removeItem(key(slug));
  } catch {
    return undefined;
  }
  return progress(storage, slugs, slug);
}

// The elements of the tracker: the tracker, its button and its counter.
type Ui = { tracker: Pick<HTMLElement, 'hidden'>; button: Pick<Element, 'setAttribute'>; count: Pick<Node, 'textContent'> };

// Without storage, the tracker cannot keep the progress, so the page does not show it.
export function show(p: Progress | undefined, { tracker, button, count }: Ui) {
  tracker.hidden = !p;
  if (!p) return;
  button.setAttribute('aria-pressed', String(p.read));
  count.textContent = String(p.count);
}
