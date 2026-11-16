// docs/DESIGN.md "Sourcing rules": a chapter body cites only the sources in its sources field. Links between chapters and links to the GitHub pages of this repo are exempt.
// A link between chapters has no scheme and does not start with //, for example /launch-path/main-thread/.
const external = /^(https?:)?\/\//i;
const repo = /^https:\/\/github\.com\/imGurpreetSK\/android-from-first-principles([/?#]|$)/i;

// A citation is a source plus a line, a heading or a timestamp (docs/DESIGN.md "Sourcing rules").
// The anchor holds the line (#123, #L123) or the heading. A YouTube link holds the timestamp in the t query parameter, for example watch?v=<id>&t=95s.
const youtube = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;
const timestamp = /([?&])t=[^&]*&?/;

// Returns the link without its anchor and timestamp.
export function source(link: string) {
  const s = link.split('#')[0];
  return youtube.test(s) ? s.replace(timestamp, '$1').replace(/[?&]$/, '') : s;
}

// Returns true if the link must cite a source.
export const needsSource = (link: string) => external.test(link) && !repo.test(link);

// Returns the link without its anchor and timestamp, if the link must cite a source and sources does not have it.
export function missingSource(link: string, sources: readonly string[]) {
  if (!needsSource(link)) return undefined;
  const s = source(link);
  return sources.includes(s) ? undefined : s;
}
