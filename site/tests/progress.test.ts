import { expect, test } from 'vitest';
import { progress, show, toggle } from '../src/progress';

// A fake localStorage in memory.
const fake = () => {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
};
const slugs = ['apk', 'zygote', 'main-thread'];

test('a chapter is not read until the reader marks it', () => {
  const storage = fake();
  expect(progress(() => storage, slugs, 'zygote')).toEqual({ read: false, count: 0 });
});

test('the reader marks a chapter as read, then as not read', () => {
  const storage = fake();
  expect(toggle(() => storage, slugs, 'zygote')).toEqual({ read: true, count: 1 });
  expect(progress(() => storage, slugs, 'zygote')).toEqual({ read: true, count: 1 });
  expect(toggle(() => storage, slugs, 'zygote')).toEqual({ read: false, count: 0 });
  expect(progress(() => storage, slugs, 'zygote')).toEqual({ read: false, count: 0 });
});

test('the count includes the read chapters of other pages', () => {
  const storage = fake();
  toggle(() => storage, slugs, 'apk');
  toggle(() => storage, slugs, 'main-thread');
  expect(progress(() => storage, slugs, 'zygote')).toEqual({ read: false, count: 2 });
});

test('the count includes only the chapters on the site', () => {
  const storage = fake();
  // A chapter that the reader marked as read, and that is no longer on the site.
  toggle(() => storage, [...slugs, 'removed'], 'removed');
  toggle(() => storage, slugs, 'apk');
  expect(progress(() => storage, slugs, 'apk')).toEqual({ read: true, count: 1 });
});

test('the key of a chapter is its chapter slug, so the progress stays if the chapter moves to another section', () => {
  const storage = fake();
  toggle(() => storage, slugs, 'main-thread');
  expect(storage.getItem('read:main-thread')).toBe('1');
});

test('without storage, the functions return undefined and do not throw', () => {
  // If the browser does not let the page keep data, the localStorage getter throws a SecurityError: https://html.spec.whatwg.org/multipage/webstorage.html#dom-localstorage
  const blocked = () => {
    throw new DOMException('Storage is blocked.', 'SecurityError');
  };
  expect(progress(blocked, slugs, 'apk')).toBeUndefined();
  expect(toggle(blocked, slugs, 'apk')).toBeUndefined();
});

test('if a write to storage fails, toggle returns undefined and the chapter stays not read', () => {
  const storage = fake();
  // If setItem cannot keep the value, it throws a QuotaExceededError: https://html.spec.whatwg.org/multipage/webstorage.html#dom-storage-setitem
  const full = {
    ...storage,
    setItem: () => {
      throw new DOMException('Storage is full.', 'QuotaExceededError');
    },
  };
  expect(toggle(() => full, slugs, 'apk')).toBeUndefined();
  expect(progress(() => storage, slugs, 'apk')).toEqual({ read: false, count: 0 });
});

// The elements of the tracker as plain objects. As in the built page, the tracker is hidden at the start.
const elements = () => {
  const attributes = new Map<string, string>();
  return { tracker: { hidden: true }, button: { setAttribute: (name: string, value: string) => void attributes.set(name, value) }, count: { textContent: '0' }, attributes };
};

test('without storage, show keeps the tracker hidden', () => {
  const ui = elements();
  show(undefined, ui);
  expect(ui.tracker.hidden).toBe(true);
});

test('with storage, show shows the tracker, the state of the button and the count', () => {
  const ui = elements();
  show({ read: true, count: 1 }, ui);
  expect(ui.tracker.hidden).toBe(false);
  expect(ui.attributes.get('aria-pressed')).toBe('true');
  expect(ui.count.textContent).toBe('1');
});
