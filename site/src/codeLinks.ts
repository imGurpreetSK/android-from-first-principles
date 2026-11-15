// docs/DESIGN.md "Sourcing rules": a code link points to a pinned ref, on the host of its project. A branch moves, so a link to a branch is not pinned.

// A Gitiles link, for example on android.googlesource.com, puts the ref after the first /+/.
// The link is pinned only if the ref is refs/tags/<tag> or a full 40-character commit SHA. A short ref, for example +/main/, can resolve to a branch.
const gitilesPin = /^[^+]*\/\+\/(refs\/tags\/[^/]+|[0-9a-f]{40})(\/|$)/;

// docs/DESIGN.md "Sourcing rules": a chapter cites code only on Gitiles hosts and on github.com.
// These hosts show code, and a link on them can follow a moving ref, for example elixir.bootlin.com/linux/latest/ or git.kernel.org/.../tree/<path>.
// The rules reject each link on these hosts. A doc page on another host passes, for example on docs.kernel.org.
const otherCodeHosts = new Set(['elixir.bootlin.com', 'git.kernel.org', 'gitlab.com', 'bitbucket.org', 'sourcegraph.com', 'cs.opensource.google', 'searchfox.org']);

// Returns what to do if the source breaks a code link rule that needs no network. Returns undefined if the source obeys these rules.
// The rules reject these URL forms. The first rule that the source breaks gives the return value.
// 1. Each link on cs.android.com or on a host in otherCodeHosts.
// 1a. Each link on kernel.googlesource.com or on github.com/torvalds/linux. Kernel code comes from android.googlesource.com kernel/common.
// 1b. Each link to sqlite.org/src/, www.sqlite.org/src/ or sqlite.org/cgi/src/ (it redirects to /src/). SQLite code is in Fossil, and a link there can follow a branch. A doc page on sqlite.org, for example /wal.html, passes.
// 2. Each link on raw.githubusercontent.com or on www.github.com. The other rules and the GitHub tag check read only links on github.com.
// 3. Each link to a Gerrit change: on a Gerrit host, *-review.googlesource.com, or on r.android.com, which redirects to android-review.googlesource.com. A Gerrit change has no Gitiles ref, so the Gitiles rule gives the wrong fix.
// 4. A link to a GitHub copy of AOSP or AndroidX: github.com/aosp-mirror/<repo>, a repo whose name starts with platform_ or android_ (for example android/platform_frameworks_base, which GitHub redirects to aosp-mirror, or the fork LineageOS/android_frameworks_base), or github.com/androidx/androidx.
// 5. A link to R8 code on github.com or on a Gitiles host other than r8.googlesource.com. R8 code has the package path com/android/tools/r8/.
// 6. A link to AGP code on github.com or on a Gitiles host, outside android.googlesource.com/platform/tools/base. AGP code has the package paths com/android/build/ and com/android/builder/. R8 on r8.googlesource.com also has com/android/build/shrinker/, so the rule skips r8.googlesource.com.
// 7. A Gitiles link without +/refs/tags/<tag>/ or +/<40-character SHA>/.
export function codeLinkError(source: string) {
  const url = URL.parse(source);
  if (!url) return undefined;
  const { hostname: host, pathname: path } = url;
  const gitiles = host.endsWith('.googlesource.com');
  const code = gitiles || host === 'github.com';
  if (host === 'cs.android.com') {
    return 'Do not cite cs.android.com. Cite the file on its Gitiles host, for example android.googlesource.com, at a tag or a full SHA.';
  }
  if (otherCodeHosts.has(host)) {
    return 'Cite the file on its Gitiles host or on github.com, at a tag or a full SHA. Cite kernel code on android.googlesource.com, for example in kernel/common.';
  }
  if (host === 'kernel.googlesource.com' || (host === 'github.com' && /^\/torvalds\/linux(\/|$)/i.test(path))) {
    return 'Cite kernel code on android.googlesource.com in kernel/common, at a tag or a full SHA.';
  }
  if ((host === 'sqlite.org' || host === 'www.sqlite.org') && /^\/(cgi\/)?src\//.test(path)) {
    return 'Cite SQLite code on github.com/sqlite/sqlite at its version tag, or in platform/external/sqlite on android.googlesource.com at a tag.';
  }
  if (host === 'raw.githubusercontent.com' || host === 'www.github.com') {
    return 'Cite the file on github.com: github.com/<owner>/<repo>/blob/<tag or full SHA>/<path>.';
  }
  if (host === 'r.android.com' || host.endsWith('-review.googlesource.com')) {
    return 'Do not cite a Gerrit change. Cite the file on its Gitiles host at a tag or a full SHA.';
  }
  if (host === 'github.com' && /^\/(aosp-mirror\/|[^/]+\/(platform|android)_|androidx\/androidx(\/|$))/i.test(path)) {
    return 'Cite AOSP and AndroidX code on android.googlesource.com, not on a GitHub mirror or fork.';
  }
  if (code && path.includes('/com/android/tools/r8/') && host !== 'r8.googlesource.com') {
    return 'Cite R8 code on r8.googlesource.com.';
  }
  if (code && /\/com\/android\/build(er)?\//.test(path) && host !== 'r8.googlesource.com' && !(host === 'android.googlesource.com' && path.startsWith('/platform/tools/base/+/'))) {
    return 'Cite AGP code in platform/tools/base on android.googlesource.com.';
  }
  if (gitiles && !gitilesPin.test(path)) {
    return 'Pin the Gitiles link to a tag or to a commit. Write +/refs/tags/<tag>/ or +/<40-character commit SHA>/. A short +/<ref>/ link can point to a branch, and a branch moves.';
  }
  return undefined;
}

// A GitHub link to code, for example https://github.com/Kotlin/kotlinx.coroutines/blob/1.10.2/README.md. The ref is the path segment after blob, tree, blame or raw, or after refs/tags/ if it follows them.
// Other github.com pages, for example a repo root, an issue or a release, are not code links. Gitiles hosts have only code, so gitilesPin checks each URL on them.
const github = /^https?:\/\/github\.com\/([^/]+\/[^/]+)\/(?:blob|tree|blame|raw)\/(?:refs\/tags\/)?([^/?#]+)/i;
const sha = /^[0-9a-f]{40}$/;
// Each line of git ls-remote --tags is "<SHA>\trefs/tags/<tag>". An annotated tag also has a line that ends in ^{}.
const tag = /\trefs\/tags\/(.+?)(\^\{\})?$/gm;

// Returns each GitHub code link in sources whose ref is not a full 40-character SHA and not a tag.
// lsRemote(repo) returns the output of git ls-remote --tags <repo>. This function calls it one time for each repo, and only for a repo with a link that has no full SHA.
export function unpinned(sources: readonly string[], lsRemote: (repo: string) => string) {
  const tags = new Map<string, Set<string>>();
  return sources.filter((source) => {
    const [, repo, ref] = github.exec(source) ?? [];
    if (!repo || sha.test(ref)) return false;
    let repoTags = tags.get(repo);
    if (!repoTags) tags.set(repo, (repoTags = new Set(Array.from(lsRemote(`https://github.com/${repo}`).matchAll(tag), (m) => m[1]))));
    return !repoTags.has(ref);
  });
}
