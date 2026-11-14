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
title: The main thread: Looper, Handler, MessageQueue
section: The Launch Path
checked: Android <version> (AOSP <tag>), <library versions>
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

- "Build it naive" and "Where it breaks" are a pair. Each chapter with a rebuild has a breaking test.
- A chapter without a rebuild has no `samples/` module.
- The chapter plan sets "Try it". If `rebuild` is true, "Try it" has prompts that change the rebuild. If `device` is true, it has device prompts. If both are false, the chapter has no "Try it".
- The chapter plan sets the shape of the chapter at the Plan step. The Draft step does not change the shape.

## Sourcing rules

- Each chapter starts from a **source list** that the maintainer approves. The sources are AOSP code, official docs, talks and library code.
- A draft cites **only** sources from that list. A source is one entry: one code file at a pinned ref, one doc page or one talk.
- CI enforces this rule. CI removes the line number, anchor or timestamp from each external link in a chapter body. The result must exactly match an entry in `sources`. Links between chapters and links to the GitHub pages of this repo are exempt.
- Each non-obvious claim has a citation:
  - Code: a pinned ref, a file and a line. A branch moves, so never cite a branch. If CI cannot prove that a code link is pinned, CI rejects the link:
    - Gitiles: `+/refs/tags/<tag>/` or a full 40-character SHA. CI rejects the short `+/<ref>/` form, because it can resolve to a branch.
    - GitHub: a full SHA, or a ref that `git ls-remote --tags` shows is a tag. The link check runs `git ls-remote` one time for each repo.
    - AOSP: a release tag. Section 1 uses `android-17.0.0_r1`.
    - AndroidX/Jetpack: a full commit SHA from the release branch of the library (for example `androidx-lifecycle-release`) at the version in `checked`. AndroidX has no release tags.
    - Libraries with GitHub release tags (kotlinx.coroutines, OkHttp, Retrofit, …): the tag.
    - Host: AOSP and AndroidX links point only to `android.googlesource.com` (Gitiles). Gitiles gives real 404s to the link check and has `#<line>` anchors. It also serves AndroidX release-branch SHAs, which the GitHub mirror sometimes does not have. Other Google code on Gitiles links there at its tag, for example R8 on `r8.googlesource.com` and AGP in `platform/tools/base`. All other code links to GitHub at its tag. A chapter can name cs.android.com in plain text as a place to browse code. A chapter never cites it.
  - Docs: the URL of the page, not an archive snapshot. There is no way to pin a doc page. Its owner can rewrite it. The `checked` stamp records when the editor checked the page. If a page no longer supports its claim, open a "Challenge a claim" issue. If code can support a claim, cite the code.
  - Talks: the URL and a timestamp.
- The `checked` stamp names the **baseline** of the chapter: the Android release whose behavior the chapter describes as current. The stamp also names the library versions against which the editor checked the claims. If the chapter depends on Play services, the stamp also names the Play services version. The site shows the stamp at the top of each chapter.
- The baseline is the latest stable Android release when the maintainer approves the chapter plan. Exception: Section 1 follows one cold start, so all its chapters use Android 17 (`android-17.0.0_r1`).
- Behavior is different across OS versions, OEMs and Play services. Chapters handle the differences inline:
  - **OS versions:** "Since Android N…" notes. Each note cites the behavior-changes page of that release or the AOSP code at its tag. Chapters cover releases back to Android 10 (API 29), the minSdk of the series. Older behavior is out of scope.
  - **OEMs and devices:** chapters describe AOSP behavior. If OEMs can differ, cite the Compatibility Definition Document (CDD). Chapters make no OEM-specific claims.
  - **Play services:** its code is not public, so claims cite only its docs.
- The stamp is a record, not a promise. Nobody checks chapters again on a schedule. A chapter changes only if a "Challenge a claim" issue or a behavior change in the Android release notes applies to it:
  - If a claim is wrong at its baseline, correct it.
  - If a newer release changes a claim, add a "Since Android N…" note that cites that release. The baseline stays the same, because nobody checked the other claims against the newer release.
  - A baseline move needs a new check of each claim, so it runs the full chapter pipeline again. The maintainer moves a baseline only if the chapter is too far out of date.
- Quoted AOSP code (Apache 2.0) is a short excerpt with a link. Rebuilds in `samples/` are original code, not copies.

## Curriculum

35 chapters in 7 sections. Section 1 follows one cold start, from launcher tap to first frame. It gives the process, main-thread and lifecycle model that all later chapters use.

The chapter slug identifies a chapter. The slug is a topic name, unique across the series (`main-thread`). The number and the section of a chapter never identify it. The progress key and the `samples/main-thread` module use the slug. The URL adds the section, so that the URL is easy to read (`/launch-path/main-thread/`). If a PR moves a chapter to another section, the URL changes, and the same PR adds a redirect from the old URL. The numbers below are display labels from the sidebar order. They can change if the maintainer adds or splits chapters.

**1. The Launch Path (tap → first frame)**
01 APK: what the build actually produces
02 Zygote & the app process
03 Binder & system_server
04 Components & lifecycle
05 Main thread: Looper / Handler / MessageQueue
06 Choreographer & the first frame

**2. State & Survival**
07 Config changes & ViewModel
08 Process death & saved state
09 Dependency injection
10 Navigation & the back stack
11 Unidirectional data flow

**3. Concurrency**
12 Threads, executors & ANR
13 Coroutines from continuations
14 Flow (cold/hot, StateFlow)
15 Structured concurrency & cancellation

**4. UI Machinery**
16 Views: measure / layout / draw
17 Rendering pipeline & jank
18 Compose runtime: snapshots & recomposition
19 Compose layout & modifiers
20 Input & touch dispatch

**5. Data & I/O**
21 Files & DataStore
22 SQLite & Room
23 Networking: OkHttp & Retrofit
24 Images & memory
25 Background work & Doze

**6. Production**
26 Tracing: Perfetto & reading a trace
27 Memory & leaks
28 Startup & performance (ART, R8, profiles)
29 Observability: crashes, ANRs, field metrics
30 Security & permissions
31 Gradle & the build
32 Toolchain versions: Gradle, AGP, Kotlin, R8 & the SDK levels
33 Testing
34 CI/CD: signing, bundles, release

**7. Beyond One Platform**
35 Kotlin Multiplatform: one codebase, many compilers

## Launch scope

Launch is the announcement, made when all 35 chapters are published: each through the full pipeline (plan, draft, edit, review), with tested samples wherever a chapter has a rebuild.

- Before launch, the site deploys from `main` as normal: live on the free subdomain, unlinked and unannounced. Each chapter merges when its review passes; no launch branch.
- The site only ever shows published chapters. There are no coming-soon pages, before or after launch.

## Chapter pipeline

1. **Plan.** Build the chapter plan: its source list, whether it has a rebuild, and whether it has device prompts (AI may suggest; the maintainer approves). The plan is the chapter file's frontmatter (`sources`, `rebuild`, `device`), committed alone as the first commit of the chapter's PR. The maintainer approves it with a "plan approved" PR review comment before any drafting. The maintainer is one person, named by GitHub handle in `CONTRIBUTING.md`; only that handle's comment counts.
2. **Draft.** AI (or a contributor, by hand) drafts the chapter and, if the plan has one, the `samples/` rebuild and its breaking tests, citing only from the approved list.
   - Drafting never edits `sources`, `rebuild` or `device`. A change to them is a **plan amendment**: its own frontmatter-only commit, approved with a new "plan approved" comment before drafting continues.
   - `/chapter-draft` stops and names the source when it needs one that isn't listed.
   - CI doesn't enforce this; plan commits are visible in the PR diff at review.
3. **Check.** CI verifies that links resolve, every citation points to a listed source, code links are pinned, samples build and tests pass.
4. **Edit.** The chapter's `edited_by` checks every claim against its source, line numbers and anchors included, editing on the branch while reading the PR's Vercel preview.
5. **Review.** The maintainer reviews the PR, re-runs any device prompts, and merges. On the maintainer's own chapters, edit and review are the same pass.

The steps ship as two repo-level Claude commands so every chapter runs the same way, split at the approval gate: `/chapter-plan <slug>` writes the plan and stops; `/chapter-draft <slug>` refuses to run until the plan is approved. `CONTRIBUTING.md` documents the same steps for contributors working by hand.

## Site

- **Framework:** Astro + Starlight. Built in: sidebar, Pagefind search, dark mode, prev/next, "Edit on GitHub".
- **Custom:** a reading-progress tracker. A manual "Mark as read" button at the end of each chapter and an "X / N" counter, stored in `localStorage`. N is the number of chapters on the site.
- **Look:** Starlight layout with minimal theming:
  - Android-green accent.
  - Roboto for text, Roboto Mono for code, both self-hosted.
  - A short home-page hero with the tagline.
- **Diagrams:** Mermaid inside MDX, rendered in the browser by `astro-mermaid` (no headless browser in the build; follows dark mode).
- **Hosting:** Vercel on the free subdomain. Every PR gets a preview deploy.

## Code samples

- `samples/` is a Gradle project in this repo: one module per chapter with a rebuild, named by chapter slug, plus `samples/launch-app`. The site lives in `site/` alongside it.
- Chapters import snippets directly from `samples/` files, so the text never shows code that doesn't compile.
  - Shown lines sit between `// region <name>` and `// endregion` comments in the sample.
  - A chapter shows them with `<Snippet file="main-thread/src/main/kotlin/NaiveLooper.kt" region="loop" />`, rendered by Starlight's built-in code blocks. `file` is a full path under `samples/`, so "Where it breaks" can show test files the same way.
  - A missing file or region fails the build.
- Rebuilds are plain Kotlin (JVM) modules tested with JUnit. `samples/launch-app` is the only Android module.
- Rebuilds never import `android.*`. Where the mechanism touches an Android type, the rebuild uses a small Kotlin stand-in (a `Map` for `Bundle`, a data class for `MotionEvent`). Real platform behavior is shown with device prompts, not in rebuilds. No Robolectric.
- A breaking test passes when the rebuild shows its flaw (e.g. asserts the lost update happened). Its name says what it shows: `naiveLoop_losesUpdate_whenTwoThreadsWrite`.
- Breaking tests are deterministic: fake clocks, scripted thread order, counters. No real sleeps, wall-clock timing or racing threads. A rebuild may take a pluggable clock or scheduler so the test can control it.
- The real fix is not rebuilt; "The real thing" points to the platform code.
- `samples/launch-app` is one tiny Android app whose cold start Section 1 follows: a platform `android.app.Activity` showing one `TextView`, no dependencies, so the cold start is the bare platform path. Chapter 06 notes that Compose's `AndroidComposeView` is a View on the same path. It is the series' only Android app: every chapter with `device: true` runs its device prompts on it in an emulator (`adb shell ps`, logcat, `Looper.setMessageLogging`, `dumpsys deviceidle`, Perfetto). Never a second Android module. Instead:
  - The default flavor is the Section 1 app. Its code is frozen once Section 1 ships, and it pins `targetSdk = 37`, so captured cold-start output stays true. Its name is `launchPath`, and it sets `isDefault = true`. All six Section 1 chapters share it, so its name comes from the section (`launch-path`), not from a chapter slug. Section 1 device prompts run `./gradlew :launch-app:installLaunchPathDebug`.
  - The toolchain (AGP, Kotlin, compileSdk) is shared across `samples/` and upgrades project-wide whenever needed; readers open it in current Android Studio, which refuses old AGP.
  - A later chapter that needs more adds a product flavor named by its slug (`launch-app/src/doze/`, `dozeImplementation(...)`). Its prompts run that flavor (`./gradlew :launch-app:installDozeDebug`), which no other chapter touches.
  - A chapter flavor pins `targetSdk` to its chapter's baseline API level, so `targetSdk`-gated behavior in its output matches the baseline. It moves only when the chapter's baseline moves.
  - CI only builds it.
- Every device prompt shows the output the reader should see. The chapter's `edited_by` captures it on an emulator matching the `checked` stamp; it counts as a verified claim. On a contributor's chapter the maintainer re-runs the prompts before merging. Values that vary by run or toolchain (PIDs, timestamps, sizes, hashes) are shown as `…`, so a toolchain upgrade doesn't force re-capture.
- CI (GitHub Actions) builds the site, builds `samples/`, runs all tests and checks source links.
- Link checks fetch each `sources` entry once (citations are a source plus an anchor, so they aren't fetched):
  - On PRs: only changed chapters' sources, with retry on rate limits. Blocking.
  - Weekly scheduled run: all chapters' sources. Opens an issue on dead links. Non-blocking.
  - Line numbers and anchors aren't checked; that's `edited_by`'s job in the edit step.

## Contributing

- Anyone can open a **"Challenge a claim"** issue (chapter, claim, counter-source) or send a fix PR.
- Anyone can propose a new chapter (a new topic, or a split of an existing one) in an issue. If the maintainer adds it to the curriculum, the proposer is assigned and follows the pipeline above; the chapter appears on the site only once published. The maintainer unassigns a stalled proposal with a comment.
- Contributions come in under the repo's licenses. No contributor license agreement.

## License

- Writing: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Commercial use is allowed for everyone, so contributed chapters never block a future book or course. Why: [ADR 0001](adr/0001-cc-by-sa-for-writing.md).
- Code in `samples/`: MIT
- Quoted third-party code (AOSP, AndroidX, libraries) keeps its own license; each excerpt links to its pinned source file. The site footer says so in one line.

## Credit

The README and site footer carry one line: "Format inspired by Backend from First Principles", with a link.

## AI disclosure

- The README and an About page say plainly: most chapters are drafted with AI from a maintainer-approved source list, then edited and verified by a human; every claim links to its source; spot an error, challenge the claim.
- `edited_by` names the person who verified every claim against its sources. On a contributor's chapter that is the contributor; the maintainer's review is the merge and is not credited.
- `edited_by` means verified at the baseline. Later fixes and "Since Android N…" notes are checked in their own PR's review and live in git history; they don't change `edited_by`. Only a baseline move resets it.
- Each chapter footer says which kind it is, from `drafted`: "Drafted with AI, edited by <name>" or "Written by <name>".

## Open items

- Connect Vercel to the repo.
- Spike: confirm a contributor's PR from a fork gets a Vercel preview (step 4 depends on it), and what the maintainer must authorize.
- Spike: confirm `astro-mermaid` renders one diagram in light and dark mode on a Vercel preview with current Astro/Starlight.
- Build plan: pending.
