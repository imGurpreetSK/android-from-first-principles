# Android from First Principles

A free online series that explains the machinery under Android app development, one chapter at a time, with every claim cited.

## Language

### Content

**Chapter**:
One page of the series on one topic, belonging to one Section and identified by its chapter slug.
_Avoid_: lesson, article, post

**Chapter slug**:
A chapter's permanent name-based identity, such as `main-thread`, unique across the series. Its number and its section are not part of it; both may change.
_Avoid_: chapter number, chapter ID

**Section**:
A named group of consecutive chapters, such as "The Launch Path".
_Avoid_: part, module, unit

**Published chapter**:
A chapter that is fully edited, sourced and live on the site.
_Avoid_: done, released, live

**Rebuild**:
A small toy version of a mechanism, written from scratch in Kotlin, that a chapter builds before showing the real code. It is optional and always comes with a test showing where it breaks.
_Avoid_: naive implementation, demo, example

**Breaking test**:
The test paired with a rebuild that shows where it breaks. It passes when the flaw shows up, and it is deterministic.
_Avoid_: failing test, failure test

**Launch app**:
The one tiny Android app whose cold start Section 1 follows, from launcher tap to first frame. It is the series' only Android app; every device prompt runs on it.
_Avoid_: demo app, sample app

**Device prompt**:
A "Try it" step the reader runs on an emulator against the launch app, shown with the output they should see.
_Avoid_: exercise, lab

**Go deeper box**:
A collapsible aside inside a chapter that covers platform internals. A reader can skip it and still follow the chapter.
_Avoid_: deep dive, advanced section, sidebar

### Sourcing

**Source**:
One approved reference for a chapter: a single code file at a pinned version, a single doc page, or a single talk.
_Avoid_: reference, resource

**Source list**:
The set of sources a chapter may cite, approved by the maintainer before drafting.
_Avoid_: bibliography, references

**Citation**:
An inline link from a claim to a specific spot inside a listed source: a line, a heading, or a timestamp.
_Avoid_: footnote, reference

**Checked stamp**:
The chapter's record of its baseline and the library versions its claims were verified against.
_Avoid_: version, last updated

**Baseline**:
The Android release whose behavior a chapter describes as current. Differences in other releases, back to Android 10, appear as inline notes.
_Avoid_: target version, supported version

### Making a chapter

**Claim**:
A factual statement in a chapter. Every non-obvious claim carries a citation, and anyone can challenge one.
_Avoid_: using "claim" for reserving a chapter

**Maintainer**:
The one person who approves chapter plans and merges chapters.
_Avoid_: owner, admin, reviewer

**Editor**:
The one person credited with verifying every claim in a chapter against its sources at the chapter's baseline. Later fixes don't change who it is; only a baseline move does.
_Avoid_: reviewer, author

**Chapter plan**:
The maintainer-approved source list for a chapter, plus whether the chapter has a rebuild and device prompts. Settled before drafting starts.
_Avoid_: outline, brief

**Plan amendment**:
A change to an approved chapter plan during drafting, such as adding a source. It needs its own approval before drafting continues.
_Avoid_: plan update, adding a source
