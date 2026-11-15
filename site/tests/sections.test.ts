import { describe, expect, test } from 'vitest';
import { checkChapters } from '../src/sections';

// A docs entry as the docs loader stores it. If section is set, the entry is a chapter.
const entry = (id: string, section?: string, filePath = `src/content/docs/${id}.md`, order?: number) => ({
  id,
  data: section ? { title: id, section, sidebar: { order } } : { title: id },
  filePath,
});

describe('checkChapters', () => {
  test('accepts chapters at /<section-slug>/<chapter-slug>/ and pages without a section', () => {
    expect(() =>
      checkChapters([entry('index'), entry('launch-path/main-thread', 'The Launch Path'), entry('concurrency/flow', 'Concurrency')]),
    ).not.toThrow();
  });

  test.each([
    ['in the directory of a different section', 'concurrency/main-thread', undefined],
    ['at the root of the docs', 'main-thread', undefined],
    ['in a subdirectory of its section', 'launch-path/looper/main-thread', undefined],
    ['in its own directory', 'launch-path/main-thread', 'src/content/docs/launch-path/main-thread/index.md'],
    ['in the directory of a different section, with a slug field that gives the URL of its section', 'launch-path/main-thread', 'src/content/docs/concurrency/main-thread.md'],
    ['in the directory of its section, with a slug field that gives a different URL', 'main-thread', 'src/content/docs/launch-path/main-thread.md'],
    ['in the directory of its section, with a slug field that gives the URL of a different section', 'concurrency/main-thread', 'src/content/docs/launch-path/main-thread.md'],
    ['in the directory of its section, with a slug field that gives the URL of the section', 'launch-path', 'src/content/docs/launch-path/main-thread.md'],
    ['in the directory of its section, with a slug field that gives a deeper URL', 'launch-path/looper/main-thread', 'src/content/docs/launch-path/main-thread.md'],
  ])('rejects a chapter %s', (_, id, filePath) => {
    expect(() => checkChapters([entry(id, 'The Launch Path', filePath)])).toThrow('Put the file in src/content/docs/launch-path/');
  });

  test('rejects a page without chapter fields in the directory of a section', () => {
    expect(() => checkChapters([entry('launch-path/about')])).toThrow('The page src/content/docs/launch-path/about.md is in the directory of a section');
  });

  test('rejects two chapters with the same chapter slug in different sections', () => {
    expect(() =>
      checkChapters([entry('launch-path/main-thread', 'The Launch Path'), entry('concurrency/main-thread', 'Concurrency')]),
    ).toThrow('same chapter slug "main-thread"');
  });

  test('rejects two chapters with the same sidebar.order in one section', () => {
    expect(() =>
      checkChapters([entry('launch-path/main-thread', 'The Launch Path', undefined, 5), entry('launch-path/looper', 'The Launch Path', undefined, 5)]),
    ).toThrow('same sidebar.order 5');
  });

  test('accepts chapters with the same sidebar.order in different sections', () => {
    expect(() =>
      checkChapters([entry('launch-path/main-thread', 'The Launch Path', undefined, 1), entry('state-survival/config-changes', 'State & Survival', undefined, 1)]),
    ).not.toThrow();
  });
});
