// docs/DESIGN.md "Sourcing rules": a chapter body cites only the sources in its sources field. Links between chapters and links to the GitHub pages of this repo are exempt.
// A link between chapters has no scheme, for example /launch-path/main-thread/.
const external = /^https?:\/\//i;
const repo = /^https:\/\/github\.com\/imGurpreetSK\/android-from-first-principles([/?#]|$)/i;

// A citation is a source plus a line, a heading or a timestamp (docs/DESIGN.md "Sourcing rules").
// The anchor holds the line (#123, #L123) or the heading. A YouTube link holds the timestamp in the t query parameter, for example watch?v=<id>&t=95s.
const youtube = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;
const timestamp = /([?&])t=[^&]*&?/;

// Returns the link without its anchor and timestamp, if the link must cite a source and sources does not have it.
export function missingSource(link: string, sources: readonly string[]) {
  if (!external.test(link) || repo.test(link)) return undefined;
  let source = link.split('#')[0];
  if (youtube.test(source)) source = source.replace(timestamp, '$1').replace(/[?&]$/, '');
  return sources.includes(source) ? undefined : source;
}
