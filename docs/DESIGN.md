# Android from First Principles — Design

Most Android material teaches a framework. This series teaches the machinery underneath it: why the main thread is a loop, why a ViewModel survives rotation, what really happens between a launcher tap and the first frame.

Format inspired by [Backend from First Principles](https://github.com/DsThakurRawat/Backend-from-first-Principle). No content or code is reused from it.

## Reader

- **Default reader:** mid-level Android dev (1–4 years). Uses Compose, ViewModel and coroutines daily; doesn't know what runs underneath.
- **Platform depth** (Binder, Zygote, ART, SurfaceFlinger, …) lives only in collapsible **Go deeper** boxes inside a chapter. No separate deep-dive pages. A mid-level reader must be able to skip every box and still follow the chapter.

## Chapter shape

Chapters share one skeleton. Some parts are required; the rest are optional:

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

1. The problem      required   why this exists; what breaks without it
2. Build it naive   optional   rebuild from scratch (snippet imported from samples/)
3. Where it breaks  optional   the naive version's failure, shown by a test
4. The real thing   required   map to the AOSP/Jetpack code, cited inline
5. Mental model     required   one paragraph + one Mermaid diagram to keep
6. Try it           optional   modify the rebuild and/or run device prompts, 2–3 prompts

<Go deeper> boxes anywhere: platform internals
Sources             required   auto-listed from frontmatter
```

- "Build it naive" and "Where it breaks" come as a pair: a chapter with a rebuild always has a test that shows where it breaks.
- A chapter without a rebuild has no `samples/` module.
- "Try it" follows from the plan: `rebuild` gives prompts to modify the rebuild, `device` gives device prompts on the launch app, neither means no "Try it".
- Each chapter's shape is set in its chapter plan (pipeline step 1), not chosen while drafting.

## Sourcing rules

- Every chapter starts from a **source list** the maintainer approves: AOSP source, official docs, talks, library source.
- Drafts may cite **only** from that list. A source is one entry: one code file at a pinned ref, one doc page, or one talk.
- CI enforces it: every external link in a chapter body, with its line number, anchor or timestamp removed, must exactly match an entry in `sources`. Links between chapters, and to this repo's own GitHub pages, are exempt.
- Every non-obvious claim links to its source inline:
  - Code: pinned ref + file + line, never a moving branch. CI rejects any code link that isn't provably pinned:
    - Gitiles: `+/refs/tags/<tag>/` or a full 40-character SHA. The short `+/<ref>/` form is rejected, since it may resolve to a branch.
    - GitHub: a full SHA, or a ref that `git ls-remote --tags` confirms is a tag (checked once per repo in the link check).
    - AOSP: release tag (Section 1: `android-17.0.0_r1`).
    - AndroidX/Jetpack: full commit SHA from the library's release branch (e.g. `androidx-lifecycle-release`) at the version in `checked`. AndroidX has no release tags.
    - Libraries with GitHub release tags (kotlinx.coroutines, OkHttp, Retrofit, …): the tag.
    - Host: AOSP and AndroidX links point only at `android.googlesource.com` (Gitiles): real 404s for the link check, `#<line>` anchors, and it serves AndroidX release-branch SHAs, which the GitHub mirror may lack. Other Google code on Gitiles (R8 on `r8.googlesource.com`, AGP in `platform/tools/base`) links there at its tag. Everything else links to GitHub at its tag. cs.android.com may be mentioned as plain text for browsing, never as a citation.
  - Docs: URL of the live page. Doc pages can't be pinned and may be rewritten; the `checked` stamp records when they were verified, and a page that stops supporting its claim is handled as a "Challenge a claim". No archive snapshots. Where code can back a claim, cite the code.
  - Talks: URL + timestamp.
- The `checked` stamp names the chapter's **baseline**: the Android release whose behavior the chapter describes as current, plus the library versions (and the Play services version, when the chapter depends on it) its claims were verified against. It is shown at the top of every chapter.
- The baseline is the latest stable Android release when the chapter's plan is approved. Exception: Section 1 traces one cold start, so all its chapters use Android 17, `android-17.0.0_r1`.
- Behavior varies by OS version, OEM and Play services. Chapters handle that inline:
  - **OS versions:** "Since Android N…" notes, each citing that release's behavior-changes page or the AOSP code at its tag. Coverage goes back to Android 10 (API 29), the series' minSdk; older behavior is out of scope.
  - **OEMs and devices:** chapters describe AOSP behavior. Where OEMs may differ, cite the Compatibility Definition Document (CDD). No OEM-specific claims.
  - **Play services:** closed source, so claims cite its docs only.
- The stamp is a record, not a promise. No scheduled re-checks. A chapter is touched only when a "Challenge a claim" issue or a behavior change in Android's release notes reaches it:
  - A claim wrong at its baseline is corrected.
  - A claim changed by a newer release gets a "Since Android N…" note citing that release. The baseline stays: only that claim was checked against the newer release.
  - Moving the baseline means re-checking every claim, so it runs the full pipeline again (plan PR, approval, draft, edit). The maintainer does it only when a chapter has drifted enough to warrant it.
- Quoted AOSP code (Apache 2.0) stays a short excerpt with a link. Rebuilds in `samples/` are original code, not copies.

## Curriculum

35 chapters, 7 sections. Section 1 follows one cold start, from launcher tap to first frame, and gives the process / main-thread / lifecycle model every later chapter builds on.

A chapter is identified by its chapter slug: a topic name unique across the series (`main-thread`), never its number or section. The progress key and `samples/main-thread` module use it. The URL adds the section for readability (`/launch-path/main-thread/`); moving a chapter to another section changes its URL, and the same PR adds a redirect from the old one. Numbers below are display labels from sidebar order and may shift when chapters are added or split.

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
