# Contribute to Android from First Principles

Before you start, read [AGENTS.md](AGENTS.md), [docs/DESIGN.md](docs/DESIGN.md) and [CONTEXT.md](CONTEXT.md). CONTEXT.md gives the terms that this file uses.

## Maintainer

The maintainer is [`imGurpreetSK`](https://github.com/imGurpreetSK) on GitHub. The maintainer approves chapter plans and merges chapters. Only a "plan approved" comment from this handle approves a chapter plan.

## Challenge a claim

Anyone can challenge a claim:

- Open a "Challenge a claim" issue. Give the chapter, the claim and a counter-source.
- Send a fix PR.

A chapter changes only if a "Challenge a claim" issue or a behavior change in the Android release notes applies to it:

- If a claim is wrong at its baseline, correct it.
- If a newer release changes a claim, add a "Since Android <version>…" note. The note cites the behavior-changes page of that release or the AOSP code at its tag. The baseline stays the same.

Each fix and each "Since Android <version>…" note has its own PR. That PR goes through the Fact check, Staff review and Merge steps of the chapter pipeline. It does not change `edited_by`.

The maintainer moves a baseline only if the chapter is too far out of date. A baseline move runs the full chapter pipeline again. Only a baseline move resets `edited_by`.

## Propose a chapter

Anyone can propose a new chapter in a "Chapter proposal" issue. A proposal is a new topic or a split of a chapter.

- If the maintainer adds the chapter to the [curriculum](docs/DESIGN.md#curriculum), the maintainer assigns the proposer. Then the proposer follows the chapter pipeline.
- If a proposal stalls, the maintainer unassigns it with a comment.

The site shows the chapter only after it is published.

## Chapter pipeline

These are the steps of the [chapter pipeline](docs/DESIGN.md#chapter-pipeline) for a contributor who works by hand. Obey docs/DESIGN.md, "Chapter shape", "Sourcing rules" and "Code samples".

1. **Plan.** Write the chapter plan: the source list, and whether the chapter has a rebuild and device prompts. The plan is the frontmatter of the chapter file (`sources`, `rebuild`, `device`). Put the plan alone in the first commit of the chapter PR.
   - **Approval.** Before the Draft step, the maintainer approves the plan with a "plan approved" comment on the PR. The comment can be a plain PR comment or the text of a GitHub approval. Only a comment from `imGurpreetSK` counts.
2. **Draft.** Draft the chapter. Cite only sources from the source list. If the plan has a rebuild, also add the rebuild in `samples/<chapter slug>/` and its breaking tests.
   - **Plan amendment.** The Draft step never changes `sources`, `rebuild` or `device`. A change to them is a plan amendment. Put a plan amendment in a separate commit that changes only the frontmatter. Before the draft continues, the maintainer approves the amendment with a new "plan approved" comment. CI does not enforce this rule. The maintainer sees the plan commits in the PR diff at the Merge step.
3. **Check.** CI checks that links resolve, that each citation points to a listed source and that code links are pinned. CI also checks that samples build and tests pass. After the Check step, the maintainer runs `/doc-review` on the chapter. `/doc-review` runs the Fact check and Staff review steps. Each review runs in a separate subagent. A fixer subagent applies the accepted fixes in micro commits.
4. **Fact check.** The fact checker compares each claim with its source. The fact checker also makes sure that the chapter obeys Simplified Technical English (STE).
5. **Staff review.** The staff reviewer, a staff Android engineer with 10 years of experience, makes sure that the chapter and its citations are correct.
6. **Edit.** You are the editor. Put your name in `edited_by`. Check each claim against its source, with line numbers and anchors. Edit on the branch and read the Vercel preview of the PR. If the chapter has device prompts, capture their output on an emulator with the system image that the `checked` stamp names.
7. **Merge.** The maintainer checks the PR. If the chapter has device prompts, the maintainer runs them again. Then the maintainer merges the PR.

## Commits, tests and docs

Obey the rules in [AGENTS.md](AGENTS.md). The main rules are:

- Do not add a co-author, co-committer or AI attribution to commits or PRs (rule 1).
- Make micro commits. Each commit has one change. Each commit builds and passes all tests. You can revert each commit alone (rule 2).
- Write tests for all code that has logic. Put tests in the same commit as the code that they test. If you skip tests, write the reason in the commit message (rule 3).
- Write all docs, chapters included, in Simplified Technical English (STE). AGENTS.md rule 4 gives the STE rules. Use the terms in CONTEXT.md.
- Run `git status` before each commit (rule 8).

## Build and test

Before each commit, run these commands. If a command fails, do not commit.

- Site: Run `npm ci`, `npm run build`, `npm test` and `npm run check` in `site/`.
- Samples: Run `samples/gradlew -p samples build` from the repo root. It builds `samples/` and runs all its tests. It needs JDK 17 or later.
