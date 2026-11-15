// docs/DESIGN.md "Sourcing rules": a code link points to a pinned ref. A branch moves, so a link to a branch is not pinned.

// A Gitiles link, for example on android.googlesource.com, puts the ref after the first /+/.
// The link is pinned only if the ref is refs/tags/<tag> or a full 40-character commit SHA. A short ref, for example +/main/, can resolve to a branch.
const gitilesPin = /^[^+]*\/\+\/(refs\/tags\/[^/]+|[0-9a-f]{40})(\/|$)/;

// Returns what to do if the source breaks a code link rule that needs no network. Returns undefined if the source obeys these rules.
export function codeLinkError(source: string) {
  const url = URL.parse(source);
  if (url?.hostname.endsWith('.googlesource.com') && !gitilesPin.test(url.pathname)) {
    return 'Pin the Gitiles link to a tag or to a commit. Write +/refs/tags/<tag>/ or +/<40-character commit SHA>/. A short +/<ref>/ link can point to a branch, and a branch moves.';
  }
  return undefined;
}
