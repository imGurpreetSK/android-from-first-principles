# Rules for agents and contributors

This repo holds Android from First Principles, a free online series on the machinery under Android.

- `docs/learnings.md`: past mistakes and the rules that prevent them. Read it before you start work.
- `docs/DESIGN.md`: the design decisions.
- `CONTEXT.md`: the glossary.
- Beads tracks the tasks. Run `bd ready --exclude-type epic,feature` to find work. Epics and chapter features never have direct work. Open children do not block them, so `bd ready` shows them. Run `bd prime` for the full workflow.

## Rules

1. Do not add a co-author, co-committer or AI attribution to commits or PRs. The configured git user is the only author.
2. Make micro commits. Each commit has one change. Each commit builds and passes all tests. You can revert each commit alone.
3. Write tests for all code that has logic. Put tests in the same commit as the code that they test. If you skip tests, write the reason in the commit message.
4. Write all docs in Simplified Technical English ([ASD-STE100](https://www.asd-ste100.org/)). This includes chapters. Use the fewest words that give the full information. Follow these STE rules. For this project, they are the full STE standard:
   - Write short sentences. Write one topic in each sentence.
   - Use the active voice. Use the passive voice only when you do not know who or what does the action.
   - Write instructions as commands: "Run the tests."
   - Put a condition before its instruction: "If the build fails, stop."
   - Use each word with only one meaning. Do not use synonyms. Use the terms in `CONTEXT.md`.
   - Avoid "-ing" forms, except in technical nouns.
5. Each doc gets two reviews. A different subagent does each review. The writer of the doc does not review it.
   1. The fact checker compares each claim with its source. The fact checker also makes sure that the doc obeys STE.
   2. Then the staff reviewer, a staff Android engineer with 10 years of experience, makes sure that the doc and its citations are correct.
6. If you are an agent, use subagents to write, review and validate. The parent agent starts each subagent and collects its result.
7. When an agent or subagent makes a mistake, add an entry to `docs/learnings.md` with the rule that prevents it.
8. `.gitignore` keeps local state out of the remote. Run `git status` before each commit.

## Build and test

Before each commit, run these commands. If a command fails, do not commit.

- Site: Run `npm ci`, `npm run build`, `npm test` and `npm run check` in `site/`. It needs Node 24.
- Samples: Run `samples/gradlew -p samples build` from the repo root. It builds `samples/` and runs all its tests. It needs JDK 17 or later and the Android SDK. Before you run it, set the `ANDROID_HOME` environment variable to the Android SDK directory.
