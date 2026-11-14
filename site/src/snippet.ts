import { readFileSync } from 'node:fs';

// Returns the lines between `// region <region>` and the next `// endregion` in `file` under `samples`, without the marker lines and without the indent that all lines share.
// docs/DESIGN.md, "Code samples", gives the markers.
// The build must fail if the file does not exist, if the region does not exist, if the file has the region more than one time, if the region has no endregion line, or if the region contains a region. In each of these cases, this function throws.
export function snippet(samples: URL, file: string, region: string): string {
  const lines = readFileSync(new URL(file, samples), 'utf8').split(/\r?\n/);
  const starts = lines.flatMap((line, i) => (line.trim() === `// region ${region}` ? [i] : []));
  if (starts.length !== 1) throw new Error(`File ${file} has ${starts.length} regions with the name "${region}". It must have 1.`);
  const start = starts[0];
  const end = lines.findIndex((line, i) => i > start && line.trim() === '// endregion');
  if (end < 0) throw new Error(`Region "${region}" in file ${file} has no "// endregion" line.`);
  const body = lines.slice(start + 1, end);
  if (body.some((line) => line.trim().startsWith('// region '))) throw new Error(`Region "${region}" in file ${file} contains a region. Regions must not nest.`);
  // Remove the indent that all lines share, so that a region in a class starts at column 0.
  // shortcut: this code counts the indent in characters, not in columns, so a region that mixes tabs and spaces gets a wrong indent. If a sample file uses tabs in an indent, count columns.
  const indent = Math.min(...body.filter((line) => line.trim()).map((line) => line.search(/\S/)));
  return body.map((line) => line.slice(indent)).join('\n');
}
