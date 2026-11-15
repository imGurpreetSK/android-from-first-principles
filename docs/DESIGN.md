# Android from First Principles — Design

Most Android material teaches a framework. This series teaches the machinery under the framework: why the main thread is a loop, why a ViewModel survives rotation, and what happens between a launcher tap and the first frame.

[Backend from First Principles](https://github.com/DsThakurRawat/Backend-from-first-Principle) inspired the format. This series reuses no content or code from it.

## Reader

- **Default reader:** a mid-level Android developer with 1–4 years of experience. The reader uses Compose, ViewModel and coroutines each day. The reader does not know what runs under them.
- **Platform depth** (Binder, Zygote, ART, SurfaceFlinger, …) is only in collapsible **Go deeper** boxes inside a chapter. There are no separate pages for platform depth. A mid-level reader must be able to skip each box and still follow the chapter.

## Chapter shape

All chapters have one skeleton. Some parts are required. The other parts are optional:

```
---
title: "The main thread: Looper, Handler, MessageQueue"
section: The Launch Path
sidebar:
  order: 5
checked:
  android: 17
  aosp: android-17.0.0_r1
  libraries: { kotlin: "2.4.21" }  # optional
  play_services: "<version>"  # optional
  emulator: { image: "system-images;android-37.0;google_apis;arm64-v8a", revision: 8 }  # optional
sources: [ ...approved list... ]
rebuild: true | false
device: true | false
drafted: ai | human
edited_by: <name>
---

1. The problem      required   why this exists and what breaks without it
2. Build it naive   optional   the rebuild, from scratch (snippets imported from samples/)
3. Where it breaks  optional   a breaking test shows the flaw of the rebuild
4. The real thing   required   maps the mechanism to the AOSP/Jetpack code, with citations
5. Mental model     required   one paragraph and one Mermaid diagram for the reader to keep
6. Try it           optional   2–3 prompts: change the rebuild, run device prompts, or both

<Go deeper> boxes anywhere: platform internals
Sources             required   auto-listed from frontmatter
```

- Put the title in double quotes. Without quotes, YAML does not allow `: ` in the title, and it reads ` #` as the start of a comment. In the title, write each `"` as `\"`.
- "Build it naive" and "Where it breaks" are a pair. Each chapter with a rebuild has a breaking test.
- A chapter without a rebuild has no `samples/` module.
- The chapter plan sets "Try it". If `rebuild` is true, "Try it" has prompts that change the rebuild. If `device` is true, it has device prompts. If both are false, the chapter has no "Try it".
- The chapter plan sets the shape of the chapter at the Plan step. The Draft step does not change the shape.

## Style

All docs, chapters included, use Simplified Technical English (STE). [AGENTS.md](../AGENTS.md) rule 4 gives the rules.

## Sourcing rules

- Each chapter starts from a **source list** that the maintainer approves. The sources are AOSP code, official docs, talks and library code.
- A draft cites **only** sources from that list. A source is one entry: one code file at a pinned ref, one doc page or one talk.
- CI enforces this rule. CI removes the line number, anchor or timestamp from each external link in a chapter body. The result must exactly match an entry in `sources`. Links between chapters and links to the GitHub pages of this repo are exempt.
- Each non-obvious claim has a citation:
  - Code: a pinned ref, a file and a line. A branch moves, so never cite a branch. A chapter cites code only on Gitiles hosts and on `github.com`. CI rejects each link on a list of other code hosts, for example `elixir.bootlin.com` and `git.kernel.org`. CI also rejects code links on `kernel.googlesource.com` and `github.com/torvalds/linux`. If CI cannot prove that a code link is pinned, CI rejects the link:
    - Gitiles: `+/refs/tags/<tag>/` or a full 40-character SHA. CI rejects the short `+/<ref>/` form, because it can resolve to a branch.
    - GitHub: a full SHA, or a ref that `git ls-remote --tags` shows is a tag. The link check runs `git ls-remote` one time for each repo.
    - AOSP: a release tag. Section 1 uses `android-17.0.0_r1`.
    - AndroidX/Jetpack: a full commit SHA from the release branch of the library (for example `androidx-lifecycle-release`) at the version in `checked`. AndroidX has no release tags.
    - Libraries with GitHub release tags (kotlinx.coroutines, OkHttp, Retrofit, …): the tag.
    - Host: AOSP and AndroidX links point only to `android.googlesource.com` (Gitiles). Kernel code links also point to `android.googlesource.com`, for example to `kernel/common`, at a tag or a full SHA. Gitiles gives real 404s to the link check and has `#<line>` anchors. It also serves AndroidX release-branch SHAs, which the GitHub mirror can lack. AndroidX Media has its code only on GitHub (`androidx/media`), so it links there at its tag. Other Google code on Gitiles links there at its tag, for example R8 on `r8.googlesource.com`. AGP code is in `platform/tools/base`, which has no tag for each AGP version. Pin AGP code at the `studio-<version>` tag of the Android Studio release that pairs with that AGP version, or at a full SHA. All other code links to GitHub at its tag. A chapter can name cs.android.com in plain text as a place to browse code. A chapter never cites it.
  - Docs: the URL of the page, not an archive snapshot. There is no way to pin a doc page. Its owner can rewrite it. The `checked` stamp records the versions against which the editor checked the page. If a page no longer supports its claim, open a "Challenge a claim" issue. If code can support a claim, cite the code.
  - Talks: the URL and a timestamp.
- The site shows the `checked` stamp at the top of each chapter. The stamp has these fields:
  - `android`: the **baseline** of the chapter, the Android release whose behavior the chapter describes as current. It is an integer, 10 or more.
  - `aosp`: an AOSP release tag of the `android` release, in the form `android-<android>.<n>.<n>_r<n>`, for example `android-17.0.0_r1`.
  - `libraries` (optional): the library versions against which the editor checked the claims, by library name. Each version is a string in quotes. YAML reads an unquoted `2.10` as the number `2.1`.
  - `play_services` (optional): the Play services version, as a string in quotes. If the chapter depends on Play services, the stamp has this field.
  - `emulator`: the emulator system image (`image`) and its revision (`revision`). `image` has the form `system-images;<platform>;<tag>;<abi>`. `revision` is an integer, 1 or more. If `device` is true, the stamp has `emulator`. If `device` is false, the stamp has no `emulator`.
- The baseline is the newest Android release that has an AOSP release tag when the maintainer approves the chapter plan. This rule is necessary because AOSP gets new source only in Q2 and Q4 ([source.android.com](https://source.android.com/)). Exception: Section 1 follows one cold start, so all its chapters use Android 17 (`android-17.0.0_r1`).
- Behavior is different across OS versions, OEMs and Play services. Chapters handle the differences inline:
  - **OS versions:** "Since Android <version>…" notes. Each note cites the behavior-changes page of that release or the AOSP code at its tag. Chapters cover releases back to Android 10 (API 29), the minSdk of the series. Older behavior is out of scope.
  - **OEMs and devices:** chapters describe AOSP behavior. If OEMs can differ, cite the Compatibility Definition Document (CDD). Chapters make no OEM-specific claims.
  - **Play services:** its code is not public, so claims cite only its docs.
- The stamp is a record, not a promise. Nobody checks chapters again on a schedule. A chapter changes only if a "Challenge a claim" issue or a behavior change in the Android release notes applies to it:
  - If a claim is wrong at its baseline, correct it.
  - If a newer release changes a claim, add a "Since Android <version>…" note that cites that release. The baseline stays the same, because nobody checked the other claims against the newer release.
  - A baseline move needs a new check of each claim, so it runs the full chapter pipeline again. The maintainer moves a baseline only if the chapter is too far out of date.
- Quoted AOSP code (Apache 2.0) is a short excerpt with a link. Rebuilds in `samples/` are original code, not copies.

## Curriculum

35 chapters in 7 sections. Section 1 follows one cold start, from launcher tap to first frame. It gives the process, main-thread and lifecycle model that all later chapters use.

The chapter slug identifies a chapter. The slug is a topic name, unique across the series (`main-thread`). The curriculum below gives the slug of each chapter in parentheses. The maintainer gives a new chapter its slug in the same change that adds its curriculum entry. The number and the section of a chapter never identify it. The progress key and the `samples/main-thread` module use the slug. The URL adds the section, so that the URL is easy to read (`/launch-path/main-thread/`). If a PR moves a chapter to another section, the URL changes, and the same PR adds a redirect from the old URL. The numbers below are display labels from the sidebar order. They can change if the maintainer adds or splits chapters. The sidebar sorts the chapters of a section by `sidebar.order`. Set `sidebar.order` to the position of the chapter in its section, not to its number below. For example, the main thread (05) has `sidebar.order` 5. Config changes & ViewModel (07) has `sidebar.order` 1.

**1. The Launch Path (tap → first frame)**
01 APK: what the build actually produces (`apk`)
02 Zygote & the app process (`zygote`)
03 Binder & system_server (`binder`)
04 Components & lifecycle (`components-lifecycle`)
05 Main thread: Looper / Handler / MessageQueue (`main-thread`)
06 Choreographer & the first frame (`first-frame`)

**2. State & Survival**
07 Config changes & ViewModel (`config-changes`)
08 Process death & saved state (`process-death`)
09 Dependency injection (`dependency-injection`)
10 Navigation & the back stack (`navigation`)
11 Unidirectional data flow (`unidirectional-data-flow`)

**3. Concurrency**
12 Threads, executors & ANR (`threads-and-anr`)
13 Coroutines from continuations (`coroutines`)
14 Flow (cold/hot, StateFlow) (`flow`)
15 Structured concurrency & cancellation (`structured-concurrency`)

**4. UI Machinery**
16 Views: measure / layout / draw (`views`)
17 Rendering pipeline & jank (`rendering-pipeline`)
18 Compose runtime: snapshots & recomposition (`compose-runtime`)
19 Compose layout & modifiers (`compose-layout`)
20 Input & touch dispatch (`touch-dispatch`)

**5. Data & I/O**
21 Files & DataStore (`files-and-datastore`)
22 SQLite & Room (`sqlite-and-room`)
23 Networking: OkHttp & Retrofit (`networking`)
24 Images & memory (`images-and-memory`)
25 Background work & Doze (`background-work`)

**6. Production**
26 Tracing: Perfetto & reading a trace (`tracing`)
27 Memory & leaks (`memory-leaks`)
28 Startup & performance (ART, R8, profiles) (`startup-performance`)
29 Observability: crashes, ANRs, field metrics (`observability`)
30 Security & permissions (`security-permissions`)
31 Gradle & the build (`gradle-build`)
32 Toolchain versions: Gradle, AGP, Kotlin, R8 & the SDK levels (`toolchain-versions`)
33 Testing (`testing`)
34 CI/CD: signing, bundles, release (`ci-cd`)

**7. Beyond One Platform**
35 Kotlin Multiplatform: one codebase, many compilers (`kotlin-multiplatform`)

## Launch scope

Launch is the announcement of the series. It happens when all 35 chapters are published. Each chapter goes through the full chapter pipeline. If a chapter has a rebuild, its samples have tests.

- Before launch, the site deploys from `main` as normal. The site is on the free subdomain, with no links to it and no announcement. The maintainer merges each chapter at its Merge step. There is no launch branch.
- Before and after launch, the site shows only published chapters. It has no "coming soon" pages.

## Chapter pipeline

1. **Plan.** Write the chapter plan: the source list, and whether the chapter has a rebuild and device prompts. AI can suggest the plan. The plan is the `sources`, `rebuild` and `device` fields in the frontmatter of the chapter file. The first commit of the chapter PR has only the frontmatter of the chapter file. This frontmatter sets all chapter fields: the plan fields, `title`, `section`, `sidebar.order`, `checked`, `drafted` and `edited_by`. The build rejects a chapter without them. Before the Draft step, the maintainer approves the plan with a "plan approved" comment on the PR. The comment can be a plain PR comment or the text of a GitHub approval. The maintainer is one person. `CONTRIBUTING.md` names the maintainer by GitHub handle. Only a comment from that handle counts.
2. **Draft.** AI, or a contributor by hand, drafts the chapter. If the plan has a rebuild, the draft also has the rebuild in `samples/` and its breaking tests. The draft cites only sources from the source list.
   - The Draft step never changes `sources`, `rebuild` or `device`. A change to them is a **plan amendment**. A plan amendment is a separate commit that changes only the frontmatter. Before the draft continues, the maintainer approves the amendment with a new "plan approved" comment.
   - If a fix PR adds a source to the `sources` of a chapter, that change is also a plan amendment. Before the merge, the maintainer approves it with a "plan approved" comment.
   - If `/chapter-draft` needs a source that is not in the source list, it stops and names the source.
   - CI does not enforce the plan amendment rule. The maintainer sees the plan commits in the PR diff at the Merge step.
3. **Check.** CI checks that links resolve, that each citation points to a listed source and that code links are pinned. CI also checks that samples build and tests pass.
4. **Fact check.** The fact checker compares each claim with its source. The fact checker also makes sure that the chapter obeys STE.
5. **Staff review.** The staff reviewer, a staff Android engineer with 10 years of experience, makes sure that the chapter and its citations are correct.
6. **Edit.** The editor, named in `edited_by`, checks each claim against its source, with line numbers and anchors. The editor edits on the branch and reads the Vercel preview of the PR.
7. **Merge.** The maintainer checks the PR. If the chapter has device prompts, the maintainer runs them again. Then the maintainer merges the PR. On a chapter by the maintainer, the Edit and Merge steps are one pass.

A different subagent does each review. The writer of the chapter does not review it.

Three repo-level Claude commands run the steps, so all chapters go through the same steps. The first two commands split at the plan approval:

- `/chapter-plan <slug>` writes the plan and stops.
- `/chapter-draft <slug>` does not run until the maintainer approves the plan.

`/doc-review <path>` runs the fact checker and then the staff reviewer on one doc. Each review runs in a separate subagent. A fixer subagent applies the accepted fixes in micro commits. On a contributor's chapter, the maintainer runs `/doc-review` after the Check step.

`CONTRIBUTING.md` gives the same steps for contributors who work by hand.

## Site

- **Framework:** Astro and Starlight. Built-in features: sidebar, Pagefind search, dark mode, previous and next links, "Edit on GitHub".
- **Custom:** a progress tracker for the reader. Each chapter ends with a manual "Mark as read" button. An "X / N" counter shows the progress. The tracker keeps its data in `localStorage`. N is the number of chapters on the site.
- **Look:** the Starlight layout with a minimal theme:
  - An Android-green accent color.
  - Roboto for text and Roboto Mono for code. The site hosts both fonts.
  - A short home-page hero with the tagline.
- **Diagrams:** Mermaid in MDX. `astro-mermaid` renders the diagrams in the browser, so the build needs no headless browser. The diagrams follow dark mode.
- **Host:** Vercel, on the free subdomain. Each PR gets a preview deploy.

## Code samples

- `samples/` is a Gradle project in this repo. It has one module for each chapter with a rebuild, named by chapter slug, and `samples/launch-app`. The site is in `site/`, next to `samples/`.
- Chapters import snippets directly from `samples/` files, so the text never shows code that does not compile.
  - In the sample file, `// region <name>` and `// endregion` comments mark the lines to show.
  - A chapter shows the lines with `<Snippet file="main-thread/src/main/kotlin/NaiveLooper.kt" region="loop" />`. The built-in code blocks of Starlight render them. `file` is a full path under `samples/`, so "Where it breaks" can show test files the same way.
  - If the file or the region does not exist, the build fails.
- Rebuilds are plain Kotlin (JVM) modules with JUnit tests. `samples/launch-app` is the only Android module.
- Rebuilds never import `android.*`. If the mechanism involves an Android type, the rebuild uses a small Kotlin stand-in, for example a `Map` for `Bundle` or a data class for `MotionEvent`. Device prompts, not rebuilds, show real platform behavior. The samples use no Robolectric.
- A breaking test passes when the rebuild shows its flaw. For example, the test asserts that the lost update happened. Its name tells what it shows: `naiveLoop_losesUpdate_whenTwoThreadsWrite`.
- Breaking tests are deterministic. They use fake clocks, a scripted thread order and counters. They use no real sleeps, no wall-clock time and no threads that race. A rebuild can take a pluggable clock or scheduler, so that the test can control it.
- The samples do not rebuild the real fix. "The real thing" points to the platform code.
- `samples/launch-app` is the launch app: one tiny Android app with a platform `android.app.Activity` that shows one `TextView`. The Activity is in Java, so the app has no dependencies. A Kotlin Activity adds the Kotlin standard library. With no dependencies, the cold start of the app is the bare platform path. Section 1 follows this cold start. The `first-frame` chapter notes that the `AndroidComposeView` of Compose is a View on the same path. The launch app is the only Android app of the series. Each chapter with `device: true` runs its device prompts on it in an emulator (`adb shell ps -A`, logcat, `Looper.setMessageLogging`, `dumpsys deviceidle`, Perfetto). There is never a second Android module. Instead:
  - The default flavor is the Section 1 app. After Section 1 ships, nobody changes its code. It pins `targetSdk = 37`. These two rules keep the captured cold-start output true. Its name is `launchPath`. It sets `isDefault = true`. All six Section 1 chapters share it, so its name comes from the section (`launch-path`), not from a chapter slug. Section 1 device prompts run `samples/gradlew -p samples :launch-app:installLaunchPathRelease` from the repo root.
  - All of `samples/` shares one toolchain (AGP, Kotlin, compileSdk). If the toolchain needs an upgrade, the upgrade applies to all of `samples/`. Readers open `samples/` in the current Android Studio. Android Studio refuses old AGP versions.
  - If a later chapter needs more, it adds a product flavor whose name comes from its slug. For example, the `background-work` chapter adds the `backgroundWork` flavor (`launch-app/src/backgroundWork/`, `backgroundWorkImplementation(...)`). Its device prompts run that flavor (`samples/gradlew -p samples :launch-app:installBackgroundWorkRelease` from the repo root). No other chapter uses or changes that flavor. Each chapter flavor sets `applicationIdSuffix = ".<flavor name>"`, so it installs next to `launchPath`. No two apps can have the same application ID ([build variants](https://developer.android.com/build/build-variants)). `launchPath` has no suffix, because its captured output shows its package name.
  - A chapter flavor pins `targetSdk` to the API level of the chapter baseline, so its output shows the `targetSdk`-gated behavior of the baseline. The pin changes only if the baseline of the chapter moves.
  - CI only builds the launch app.
- Device prompts run a release build that the debug key signs. The process of a debuggable app starts with JDWP and CheckJNI ([ProcessList.java, lines 1926–1932](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-17.0.0_r1/services/core/java/com/android/server/am/ProcessList.java#1926)). Thus the cold start of the release build has no debugger support and no extra native-code checks. The build is profileable, so Perfetto can still trace it.
- Each device prompt shows the output that the reader should see. The editor captures the output on an emulator with the system image for the ABI of the editor's computer (x86_64 or arm64-v8a). The `checked` stamp names this image. The output counts as a checked claim. On a contributor's chapter, the maintainer runs the prompts again before the merge, on the system image for the ABI of the maintainer's computer. Values that change between runs (PIDs, timestamps, sizes, hashes) show as `…`. Output that differs only because of the ABI also shows as `…`. A toolchain upgrade PR runs each device prompt again. If the output differs in more than the `…` values, the same PR updates the capture.
- CI (GitHub Actions) builds the site, builds `samples/`, runs all tests and checks source links.
- The link check fetches each `sources` entry one time. It does not fetch citations, because a citation is a source plus an anchor:
  - On PRs: only the sources of changed chapters. After a 429 status, a 5xx status or a network error, the check tries again, up to 3 times. If a source does not load, the check fails and blocks the PR.
  - A weekly scheduled run: the sources of all chapters. The run is not a PR check, so it does not block PRs. The run keeps the sources that do not load in one open issue, "Sources that do not load". If a source does not load, the run opens the issue, or updates the open issue. If the open issue did not list some sources that do not load, the run also adds one comment that lists these sources. If all sources load, the run closes the issue. In a public repository, GitHub turns off a scheduled workflow after 60 days with no repository activity. To turn on the workflow again, run `gh workflow enable weekly-source-check.yml`.
  - The link check does not check line numbers and anchors. The editor checks them at the Edit step.

## Contributions

- Anyone can open a **"Challenge a claim"** issue (chapter, claim, counter-source) or send a fix PR.
- Anyone can propose a new chapter in an issue: a new topic, or a split of a chapter. If the maintainer adds it to the curriculum, the maintainer assigns the proposer. The proposer follows the chapter pipeline. The site shows the chapter only after it is published. If a proposal stalls, the maintainer unassigns it with a comment.
- All contributions come under the licenses of the repo. There is no contributor license agreement.

## License

- Text, chapters included, and code in `site/`: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (root `LICENSE`). Everyone can use the text for commercial purposes, so contributed chapters never block a future book or course. [ADR 0001](adr/0001-cc-by-sa-for-writing.md) gives the reason.
- Code in `samples/`: MIT (`samples/LICENSE`)
- Quoted third-party code (AOSP, AndroidX, libraries) keeps its own license. Each excerpt links to its pinned source file. One line in the site footer tells this.

## Credit

The README and the site footer each have one line with a link: "Format inspired by Backend from First Principles".

## AI disclosure

- The README and an About page tell these facts in plain words:
  - AI drafts most chapters from a source list that the maintainer approves.
  - Two AI subagents, a fact checker and a staff reviewer, review each draft.
  - Then a human edits and checks each chapter.
  - Each non-obvious claim links to its source.
  - If you find an error, challenge the claim.
- `edited_by` names the editor: the person who checked each claim against its sources. On a contributor's chapter, the editor is the contributor. The maintainer gets no credit for the Merge step.
- `edited_by` means that the editor checked the chapter at its baseline. Each later fix and each "Since Android <version>…" note has its own PR. That PR goes through the Fact check, Staff review and Merge steps. The maintainer runs `/doc-review` on that PR after the Check step. Git history keeps them. They do not change `edited_by`. Only a baseline move resets it.
- Each chapter footer shows its kind from `drafted`: "Drafted with AI, edited by <name>" or "Written by <name>".

## Open items

- Connect Vercel to the repo.
- Spike: find out if a PR from a contributor's fork gets a Vercel preview. The Edit step needs the preview. Also find out what the maintainer must authorize.
- Spike: find out if `astro-mermaid` renders one diagram in light and dark mode on a Vercel preview with the current Astro and Starlight.
- Build plan: beads tracks the tasks. To find work, run `bd ready --exclude-type epic,feature`.
