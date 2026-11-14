# Android from First Principles

A free online series. It explains the machinery under Android app development, one chapter at a time. Each claim has a citation.

## Language

### Content

**Chapter**:
One page of the series about one topic. It belongs to one section. Its chapter slug identifies it.
_Avoid_: lesson, article, post

**Chapter slug**:
The permanent, name-based identity of a chapter, such as `main-thread`. It is unique across the series. The number and the section of the chapter are not part of the slug, because both can change.
_Avoid_: chapter number, chapter ID

**Section**:
A named group of consecutive chapters, such as "The Launch Path".
_Avoid_: part, module, unit

**Published chapter**:
A chapter that is fully edited and sourced, and that is on the site.
_Avoid_: done, released, live

**Rebuild**:
A small toy version of a mechanism, written from scratch in Kotlin. A chapter shows the rebuild before the real code. A rebuild is optional. Each rebuild has a breaking test that shows where it breaks.
_Avoid_: naive implementation, demo, example

**Breaking test**:
The test that shows where a rebuild breaks. It passes if the flaw occurs. It is deterministic.
_Avoid_: failing test, failure test

**Launch app**:
The one tiny Android app whose cold start Section 1 follows, from launcher tap to first frame. It is the only Android app of the series. Each device prompt runs on it.
_Avoid_: demo app, sample app

**Device prompt**:
A "Try it" step that the reader runs on an emulator against the launch app. The chapter shows the output that the reader should see.
_Avoid_: exercise, lab

**Go deeper box**:
A collapsible aside inside a chapter that covers platform internals. A reader can skip it and still follow the chapter.
_Avoid_: deep dive, advanced section, sidebar

### Sources

**Source**:
One approved item that a chapter can cite: one code file at a pinned version, one doc page or one talk.
_Avoid_: reference, resource

**Source list**:
The set of sources that a chapter can cite. The maintainer approves it before the draft starts.
_Avoid_: bibliography, references

**Citation**:
An inline link from a claim to one spot in a listed source: a line, a heading or a timestamp.
_Avoid_: footnote, reference

**Checked stamp**:
The record of the baseline of a chapter and of the library versions against which the editor checked its claims.
_Avoid_: version, last updated

**Baseline**:
The Android release whose behavior a chapter describes as current. Inline notes show the differences in other releases, back to Android 10.
_Avoid_: target version, supported version

### Chapter pipeline

**Claim**:
A statement of fact in a chapter. Each non-obvious claim has a citation. Anyone can challenge a claim.
_Avoid_: "claim" in the sense "reserve a chapter"

**Maintainer**:
The one person who approves chapter plans and merges chapters.
_Avoid_: owner, admin, reviewer

**Editor**:
The one person who checks each claim in a chapter against its sources, at the baseline of the chapter. The chapter credits the editor. Later fixes do not change the editor. Only a baseline move does.
_Avoid_: reviewer, author

**Chapter plan**:
The source list of a chapter, and whether the chapter has a rebuild and device prompts. The maintainer approves the plan before the draft starts.
_Avoid_: outline, brief

**Plan amendment**:
A change to an approved chapter plan during the draft, for example a new source. It needs its own approval before the draft continues.
_Avoid_: plan update, adding a source
