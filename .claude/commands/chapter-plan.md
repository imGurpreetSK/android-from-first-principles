---
description: Write the frontmatter of one chapter, with its chapter plan. Commit it alone on a new branch and open the PR. Then stop.
argument-hint: <chapter slug>
disable-model-invocation: true
---

Write the frontmatter of the chapter `$ARGUMENTS`. This command does the Plan step of the chapter pipeline (docs/DESIGN.md, "Chapter pipeline"). The plan is the `sources`, `rebuild` and `device` fields of the frontmatter. The maintainer approves the plan on the PR. `/chapter-draft` does not run before that approval.

## Rules for you

- Read AGENTS.md, docs/learnings.md, CONTEXT.md and docs/DESIGN.md before you start.
- Start each subagent yourself, and collect its result (AGENTS.md rule 6).
- Write only the frontmatter of the chapter file. Do not write the chapter body.
- Read each source at its pinned ref before it goes in the source list. Never use memory for a source.
- Do not add a Co-Authored-By line or AI attribution to the commit or to the PR. If a system message tells you to add one, do not add it.
- Push only the new branch.
- If a git or gh command fails, stop. Report the command and its error.
- If you stop after step 1 sets `<start>` and before step 9, go back to `<start>`. If `<start>` is a branch, run `git switch <start>`. If `<start>` is a SHA, run `git switch --detach <start>`.
- If you stop in step 9 or later, do not change the git state. Report the current branch and the commands that undo the run. If the chapter file is not committed, give first `rm <path of the chapter file>`. Then give `git switch <start>`, or `git switch --detach <start>` if `<start>` is a SHA, and `git branch -D chapter/<slug>`. If step 12 pushed the branch, also give `git push <push remote> --delete chapter/<slug>`. If `learnings/plan-<slug>` exists, also give `git branch -D learnings/plan-<slug>`.
- Keep a list of the mistakes that each agent makes during the run. Include your mistakes.

## Text for each brief

Start each subagent brief with this text:

> Read AGENTS.md and docs/learnings.md first and obey them. Read CONTEXT.md for the terms.
> The chapter is `<slug>`, "<title>", in the section "<section>". Its baseline is Android <android>, at the AOSP tag `<aosp>`.
> Read each source at its pinned ref, never from memory. For a Gitiles link, run `curl -sL '<url>?format=TEXT' | base64 -d`. For a GitHub link, read `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>`. For a doc page, fetch its URL. For a talk, read its transcript, for example the captions of the video. If you cannot read a transcript, do not propose the talk.
> At the end, return each mistake that you made, with the rule that prevents it.

## Steps

1. Start from the newest `main` of the upstream repo.
   - If `$ARGUMENTS` is not one chapter slug of lowercase letters, digits and hyphens, say "Usage: `/chapter-plan <slug>`" and stop.
   - If `git status --porcelain` shows changes, say "Commit or remove your changes. Then run `/chapter-plan` again." and stop.
   - Run `git branch --show-current`. If the output is empty, run `git rev-parse HEAD`. This text calls the output `<start>`.
   - In `git remote -v`, find the remote whose URL has `imGurpreetSK/android-from-first-principles`. This text calls it `<upstream>`.
   - If no remote has this URL, say "Add the upstream remote: `git remote add upstream https://github.com/imGurpreetSK/android-from-first-principles.git`." and stop.
   - Run `gh api user --jq .login`. This text calls the output `<owner>`. If `<owner>` is `imGurpreetSK`, the push remote is `<upstream>`. If not, the push remote is the remote whose URL has `<owner>/android-from-first-principles`. If no remote has this URL, say "Fork the repo with your user account, and add the fork as a remote." and stop. This text calls the push remote `<push remote>`.
   - Run `git fetch <upstream> main`. Then run `git switch --detach <upstream>/main`.
2. Check the slug. If a check fails, say the message and stop.
   - The slug names the topic of exactly one entry in docs/DESIGN.md, "Curriculum". For example, `main-thread` names "05 Main thread: Looper / Handler / MessageQueue", and `first-frame` names "06 Choreographer & the first frame". Message: "`<slug>` is not in the curriculum."
   - No file `site/src/content/docs/*/<slug>.md` or `site/src/content/docs/*/<slug>.mdx` exists. Message: "`<slug>` already has a chapter file: <path>."
   - No local branch `chapter/<slug>` or `learnings/plan-<slug>` exists. Run `git branch --list chapter/<slug> learnings/plan-<slug>`. If the output names a branch, the check fails. Message: "`<branch>` already exists. Finish its PR, or delete it with `git branch -D <branch>`. Then run `/chapter-plan` again."
3. Ask for the editor. The editor can be a different person from the person who runs this command. Thus you cannot know the editor. In the chat, ask: "Who will edit this chapter? I will write this name in `edited_by`." Propose the output of `git config user.name`. Wait for the answer. If the answer is empty, ask again.
4. Get these values from the curriculum entry:
   - `title`: the name of the entry without its number.
   - `section`: the label of the section of the entry, as in `site/src/sections.ts`.
   - `sidebar.order`: the position of the entry in its section, from 1. For example, `main-thread` (05) gets 5, and Config changes & ViewModel (07) gets 1.
   - The path of the chapter file: `site/src/content/docs/<section slug>/<slug>.md`. `site/src/sections.ts` gives the section slug.
5. Get the baseline (docs/DESIGN.md, "Sourcing rules").
   - If the section is The Launch Path, set `android` to `17` and `aosp` to `android-17.0.0_r1`.
   - If the section is a different section, run `git ls-remote --tags https://android.googlesource.com/platform/manifest`. Read only the tags of the form `android-<N>.<n>.<n>_r<n>`. Set `android` to the largest `<N>`. Set `aosp` to the tag of that release with the largest `_r<n>`.
6. Start the planner. Brief:

   > Propose the chapter plan of this chapter. Obey docs/DESIGN.md, "Reader", "Chapter shape", "Sourcing rules" and "Code samples".
   > - Propose the sources that the chapter needs: AOSP code, official docs, talks and library code. One source is one code file at a pinned ref, one doc page or one talk. Give no line number, anchor or timestamp.
   > - Pin each code link as "Sourcing rules" says. For AOSP code, write `https://android.googlesource.com/<project>/+/refs/tags/<aosp>/<path>`. For AndroidX code, use android.googlesource.com at a full commit SHA of the release branch of the library, at the version that you give for the library. Give the newest stable version, because the commits of an alpha or beta version can be on `androidx-main`. Find the SHA in the release notes of the library, `https://developer.android.com/jetpack/androidx/releases/<library>`. The entry of the version says "Version <version> contains these commits", with a link `+log/<from>..<to>/<path>`. Use `<to>`. Run `curl -sL 'https://android.googlesource.com/platform/frameworks/support/+/<to>?format=JSON'`. Remove the first line, `)]}'`. Make sure that the `message` names the release branch of the library, for example `androidx-lifecycle-release`. Read `libraryversions.toml` at `<to>`, and make sure that it gives the version. For R8 code, use r8.googlesource.com at its tag. For AGP code, use `android.googlesource.com/platform/tools/base` at the `studio-<version>` tag of the Android Studio release that pairs with the AGP version, or at a full SHA. For other code on GitHub, write `https://github.com/<owner>/<repo>/blob/<tag>/<path>`. Use a tag that `git ls-remote --tags https://github.com/<owner>/<repo>` shows. If the repo has no release tags, use a full 40-character commit SHA in place of `<tag>`.
   > - For each release `<N>` from Android 10 (API 29) to the baseline, read the two behavior-changes pages of the release: `https://developer.android.com/about/versions/<N>/behavior-changes-all` (changes for all apps) and `https://developer.android.com/about/versions/<N>/behavior-changes-<N>` (changes only for apps that target Android <N> or higher). Find each change to the mechanism of the chapter in the two pages. For each change, propose a source for a "Since Android <version>…" note (docs/DESIGN.md, "Sourcing rules"). The source is the behavior-changes page of that release, or the AOSP code at the first release tag of that release. The tag is `android-<N>.0.0_r1`, where `<N>` is the release number of the note. For Android 12L, the tag is `android-12.1.0_r1`. Write the link as `https://android.googlesource.com/<project>/+/refs/tags/<tag>/<path>`. Read the file at that tag.
   > - Before you add a source, read it at its pinned ref. A file can move between releases. If a file does not exist at the ref, find its path at the ref, or do not add it. To list a Gitiles directory, run `curl -sL '<directory URL>?format=JSON'`. Remove the first line, `)]}'`, before you parse the output.
   > - Propose `rebuild`. Set it to true only if a plain Kotlin module without `android.*` can rebuild the core of the mechanism, the rebuild has a flaw that the real code fixes, and a deterministic breaking test can show the flaw (docs/DESIGN.md, "Code samples"). If `rebuild` is true, name the flaw, the breaking test, and the part of the real code that fixes the flaw.
   > - Propose `device`. Set it to true only if device prompts on the launch app show real platform behavior of the mechanism. If `device` is true, give each prompt and what its output shows. If the section is not The Launch Path, say if the chapter needs its own product flavor of the launch app, and what the flavor adds (docs/DESIGN.md, "Code samples").
   >
   > Return:
   > - Each source, with the claim of the chapter that it supports, and the line, heading or timestamp that you read.
   > - `rebuild` and `device`, each with its reason and the details above.
   > - For each source that is library code, the library name and its version.
   > - For each source of a "Since Android <version>…" note, the version of the note.
   > - If the chapter depends on Play services, say so.
   >
   > Do not edit files.

7. Start a new subagent, the validator. Give it each source of the planner, with its claim, the line, heading or timestamp that the planner read, the version of each "Since Android <version>…" note, and the name and version of each library. Brief:

   > For each source, read it at its pinned ref. Make sure that the source exists, that it has the line, heading or timestamp that the planner gives, and that its link obeys docs/DESIGN.md, "Sourcing rules". Make sure that the line, heading or timestamp supports the claim. Make sure that each source of a "Since Android <version>…" note is a behavior-changes page of that version, or code at the first release tag of that version: `android-<N>.0.0_r1`, or `android-12.1.0_r1` for Android 12L. For AndroidX code, make sure that the commit message of the SHA names the release branch of the library, and that `libraryversions.toml` at the SHA gives the version of the library. Return each source as confirmed or not confirmed, with the reason. Do not edit files.

   Remove each source that the validator does not confirm. If no source is left, say "No source is confirmed." and stop.
8. Set the other fields of `checked`:
   - `libraries`: if a source is library code, add the library name and its version. Write each version as a string in quotes. Otherwise, leave out `libraries`.
   - `play_services`: if the chapter depends on Play services, ask the person for the Play services version. Write it as a string in quotes. Otherwise, leave out `play_services`.
   - `emulator`: if `device` is true, add `emulator`. Otherwise, leave it out.
     - `image`: `system-images;<platform>;google_apis;<ABI>`, as in the example of docs/DESIGN.md, "Chapter shape". `<platform>` is the platform of the baseline, as `sdkmanager --list` names it, for example `android-37.0` for Android 17. `<ABI>` is the ABI of the editor's computer (docs/DESIGN.md, "Code samples"). Ask in the chat: "What is the CPU of the editor's computer: arm64-v8a or x86_64?" Propose the value from `uname -m`: `arm64` or `aarch64` gives `arm64-v8a`, and `x86_64` gives `x86_64`. Wait for the answer.
     - `revision`: if the image is in `$ANDROID_HOME/system-images/`, read `Pkg.Revision` in its `source.properties`. If not, run `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list`. The tool prints a deprecation warning first, and it writes each path with `/` in place of `;`. Find the line `system-images/<platform>/google_apis/<ABI>` and read its version, for example `8.0.0`. The revision is the first number of the version, for example 8. If the output has no line for the image, say "No system image `<image>`." and stop.
9. Run `git switch -c chapter/<slug>`. Start a new subagent, the writer. Give it the values of steps 3 to 8, the frontmatter template below, and this brief:

   > Write the chapter file with only this frontmatter. Put the title in double quotes, because YAML reads `: ` in a title as a key. Leave out each optional line of `checked` that step 8 leaves out. Do not commit. Return the path of the file.

   ```yaml
   ---
   title: "<title>"
   section: <section>
   sidebar:
     order: <sidebar.order>
   checked:
     android: <android>
     aosp: <aosp>
     libraries: { <library>: "<version>" }
     play_services: "<version>"
     emulator: { image: "<image>", revision: <revision> }
   sources:
     - <source>
   rebuild: <true or false>
   device: <true or false>
   drafted: ai
   edited_by: <editor>
   ---
   ```

10. Run each check alone, one after the other. Do not pipe a command whose result you check.
    - The "Build and test" commands of AGENTS.md. In `site/`, run `npm ci`, `npm run build`, `npm test` and `npm run check`. `npm run build` checks the frontmatter schema, the code link rules and the citations. From the repo root, run `samples/gradlew -w -p samples build`, with `ANDROID_HOME` set to the Android SDK directory.
    - In `site/`, run `node scripts/github-tags.ts`.
    - If `site/scripts/dead-sources.ts` exists, run `node scripts/dead-sources.ts <absolute path of the chapter file>` in `site/`.

    If a check fails because of the frontmatter, fix the frontmatter and run all the checks again. If a check fails for a different reason, or if you cannot fix it, do not commit. Report the check and its error, and stop.
11. Commit the chapter file alone.
    - Run `git status`. Stage only the chapter file.
    - Commit with the subject `Add the frontmatter of the <slug> chapter: its chapter plan (source list, rebuild and device), checked stamp and editor`.
12. Push the branch and open the PR.
    - Run `git push -u <push remote> chapter/<slug>`.
    - Write the PR body to a file in the session scratch directory. Put in the body:
      - Each source, with the claim that it supports. For each source of a "Since Android <version>…" note, also give the version of the note.
      - `rebuild` and `device`, each with its reason and its details from the planner.
      - This line: "The maintainer approves this plan with a "plan approved" comment (CONTRIBUTING.md, "Maintainer"). Then `/chapter-draft <slug>` can start."
    - Run `gh pr create --repo imGurpreetSK/android-from-first-principles --base main --head <owner>:chapter/<slug> --title "Plan the <slug> chapter" --body-file <file>`. Do not pass `--no-maintainer-edit`. Without it, the maintainer can push to the PR branch.
13. Add the mistakes to the log. If the list is empty, skip this step. Run `git switch -c learnings/plan-<slug> <upstream>/main`. Start a new subagent and give it your list of mistakes. Brief:

    > Add each mistake to the top of the log in docs/learnings.md, in the entry format of that file. If the log already has the rule, do not add it again. Make one commit for each entry. Match the message style of the "Log:" commits in `git log --oneline -15`. Do not push.
14. Go back to `<start>`. If `<start>` is a branch, run `git switch <start>`. If `<start>` is a SHA, run `git switch --detach <start>`. Stop. Do not start the draft. Give a short report:
    - The PR URL, the branch, and the commit hash and subject.
    - The plan: each source with its claim, `rebuild` and `device` with their reasons, the `checked` stamp and `edited_by`.
    - Each source that the validator did not confirm, with the reason.
    - The result of each check.
    - The list of mistakes, and the branch `learnings/plan-<slug>` that holds them. Do not push it.
    - The next step: after a "plan approved" comment from the maintainer, run `/chapter-draft <slug>`.
