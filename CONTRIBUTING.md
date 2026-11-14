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
