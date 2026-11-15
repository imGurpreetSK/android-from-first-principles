// docs/DESIGN.md "Sourcing rules": a code link points to a pinned ref, on the host of its project. A branch moves, so a link to a branch is not pinned.

// A Gitiles link, for example on android.googlesource.com, puts the ref after the first /+/.
// The link is pinned only if the ref is refs/tags/<tag> or a full 40-character commit SHA. A short ref, for example +/main/, can resolve to a branch.
const gitilesPin = /^[^+]*\/\+\/(refs\/tags\/[^/]+|[0-9a-f]{40})(\/|$)/;

// Returns what to do if the source breaks a code link rule that needs no network. Returns undefined if the source obeys these rules.
// The rules reject these URL forms. The first rule that the source breaks gives the return value.
// 1. Each link on cs.android.com.
// 2. A link to the GitHub mirror of AOSP (github.com/aosp-mirror/<repo>) or of AndroidX (github.com/androidx/androidx).
// 3. A link to R8 code on github.com or on a Gitiles host other than r8.googlesource.com. R8 code has the package path com/android/tools/r8/.
// 4. A link to AGP code on github.com or on a Gitiles host, outside android.googlesource.com/platform/tools/base. AGP code has the package path com/android/build/ (com.android.build.gradle and com.android.build.api).
// 5. A Gitiles link without +/refs/tags/<tag>/ or +/<40-character SHA>/.
export function codeLinkError(source: string) {
  const url = URL.parse(source);
  if (!url) return undefined;
  const { hostname: host, pathname: path } = url;
  const gitiles = host.endsWith('.googlesource.com');
  const code = gitiles || host === 'github.com';
  if (host === 'cs.android.com') {
    return 'Do not cite cs.android.com. Cite the file on its Gitiles host, for example android.googlesource.com, at a tag or a full SHA.';
  }
  if (host === 'github.com' && /^\/(aosp-mirror\/|androidx\/androidx(\/|$))/i.test(path)) {
    return 'Cite AOSP and AndroidX code on android.googlesource.com, not on a GitHub mirror.';
  }
  if (code && path.includes('/com/android/tools/r8/') && host !== 'r8.googlesource.com') {
    return 'Cite R8 code on r8.googlesource.com.';
  }
  if (code && path.includes('/com/android/build/') && !(host === 'android.googlesource.com' && path.startsWith('/platform/tools/base/+/'))) {
    return 'Cite AGP code in platform/tools/base on android.googlesource.com.';
  }
  if (gitiles && !gitilesPin.test(path)) {
    return 'Pin the Gitiles link to a tag or to a commit. Write +/refs/tags/<tag>/ or +/<40-character commit SHA>/. A short +/<ref>/ link can point to a branch, and a branch moves.';
  }
  return undefined;
}
