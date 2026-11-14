import { describe, expect, test } from 'vitest';
import { snippet } from '../src/snippet';

const samples = new URL('./fixtures/snippet/samples/', import.meta.url);

describe('snippet', () => {
  test('returns the lines between the region markers, without the markers', () => {
    expect(snippet(samples, 'Sample.kt', 'loop')).toBe('fun loop() {\n    while (true) println("loop")\n}');
  });

  test('fails on a missing file', () => {
    expect(() => snippet(samples, 'Missing.kt', 'loop')).toThrow(/ENOENT.*Missing\.kt/);
  });

  test('fails on a missing region', () => {
    expect(() => snippet(samples, 'Sample.kt', 'missing')).toThrow('File Sample.kt has 0 regions with the name "missing". It must have 1.');
  });

  test('fails on a duplicate region', () => {
    expect(() => snippet(samples, 'Broken.kt', 'twice')).toThrow('File Broken.kt has 2 regions with the name "twice". It must have 1.');
  });

  test('fails on a region without an endregion line', () => {
    expect(() => snippet(samples, 'Broken.kt', 'open')).toThrow('Region "open" in file Broken.kt has no "// endregion" line.');
  });
});
