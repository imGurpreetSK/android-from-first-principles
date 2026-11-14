# Rules for agents and contributors

This repo holds Android from First Principles, a free online series on the machinery under Android.

- `docs/learnings.md`: past mistakes and the rules that prevent them. Read it before you start work.
- `docs/DESIGN.md`: the design decisions.
- `CONTEXT.md`: the glossary.
- Beads tracks the tasks. Run `bd ready` to find work. Run `bd prime` for the full workflow.

## Rules

1. Commits and PRs have no co-author, co-committer or AI attribution. The configured git user is the only author.
2. Make micro commits. Each commit has one change. Each commit builds and passes all tests. You can revert each commit alone.
3. Tests are first-class. Put tests in the same commit as the code that they test. Code with no logic can skip tests. If you skip tests, write the reason in the commit message.
4. Write all docs in clear Simplified Technical English ([ASD-STE100](https://www.asd-ste100.org/)). Use the fewest words that give the full information. Key rules:
   - Write short sentences. Write one topic in each sentence.
   - Use the active voice. Use the passive voice only when you do not know who or what does the action.
   - Write instructions as commands: "Run the tests."
   - Put a condition before its instruction: "If the build fails, stop."
   - Use each word with only one meaning. Do not use synonyms. Use the terms in `CONTEXT.md`.
   - Avoid "-ing" forms, except in technical names.
5. Each doc gets two reviews. A different subagent does each review. The writer of the doc does not review it.
   1. Reviewer 1 compares each claim with its source. Reviewer 1 also makes sure that the doc obeys STE.
   2. Then reviewer 2, a staff Android engineer with 10 years of experience, makes sure that the doc and its citations are correct.
6. Use subagents liberally. Subagents do creation, reviews and validations. The parent agent orchestrates.
7. `docs/learnings.md` is a live log. When an agent or subagent makes a mistake, add an entry with the rule that prevents it.
8. `.gitignore` keeps local state out of the remote. Run `git status` before each commit.
