# Learnings

This is a live log of mistakes by agents and subagents. Each entry gives the rule that prevents the mistake.

- Read this log before you start work.
- After a mistake, add an entry at the top of the log.

Entry format, one or two lines:

`YYYY-MM-DD: <what went wrong>. Rule: <the rule that prevents it>.`

## Log

2026-11-14: AGENTS.md used idioms, filler words and rules that were not commands. Rule: Before you commit a doc, check it against each STE rule in AGENTS.md.

2026-11-14: AGENTS.md stated an STE rule that did not match the STE FAQ. Rule: Compare each STE rule with asd-ste100.org before you write it.

2026-11-14: WebFetch got HTTP 403 from asd-ste100.org. Rule: Use `curl -sL` to read that site.

2026-11-14: A subagent could not start its own subagents. Rule: The parent agent starts every reviewer and validator.
