// docs/DESIGN.md "Sourcing rules": a chapter body cites only the sources in its sources field. Links between chapters and links to the GitHub pages of this repo are exempt.
// A link between chapters has no scheme, for example /launch-path/main-thread/.
const external = /^https?:\/\//i;
const repo = /^https:\/\/github\.com\/imGurpreetSK\/android-from-first-principles([/?#]|$)/i;

// A citation is a source plus an anchor (docs/DESIGN.md "Code samples", link check). The anchor holds the line (#123, #L123), the heading or the timestamp.
// Returns the link without its anchor, if the link must cite a source and sources does not have it.
export function missingSource(link: string, sources: readonly string[]) {
  if (!external.test(link) || repo.test(link)) return undefined;
  const source = link.split('#')[0];
  return sources.includes(source) ? undefined : source;
}
