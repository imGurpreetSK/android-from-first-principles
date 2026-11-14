# Learnings

This is a live log of mistakes by agents and subagents. Each entry gives the rule that prevents the mistake.

- Read this log before you start work.
- After a mistake, add an entry at the top of the log.

Entry format, one or two lines:

`YYYY-MM-DD: <what went wrong>. Rule: <the rule that prevents it>.`

## Log

2026-11-14: A list of instructions put a condition and its action in different bullets. Some bullets were not commands. Rule: In a list of instructions, keep each condition and its action in the same bullet. Write every bullet as a command.

2026-11-14: An agent searched inside a binary before it read the `--help` of the binary. Rule: Before you probe a binary, read its `--help`. If you must search a binary, use fixed-string `grep -F` with a timeout.

2026-11-14: Code that read `bd ... --json` output failed. Some issues have no `dependencies` key. Rule: Read optional fields in `bd ... --json` output with a default value.

2026-11-14: `bd init` without `--stealth` wrote a block into AGENTS.md, tool files (`.claude/settings.json`, `.codex/`, `.cursor/`, `.agents/`) and extra lines into `.gitignore`. Rule: This repo uses beads stealth mode. Always run `bd init --stealth`. If init writes these files, revert AGENTS.md and `.gitignore`, and delete the tool files.

2026-11-14: Each `bd create` failed because the beads DB was only half initialized. Rule: Before the first `bd create` in a workspace, run `bd info` and `bd config get issue_prefix`. If the prefix is not set, do not run `bd create`.

2026-11-14: In zsh, `echo ======` failed two times, one time in the parent agent. Zsh reads a word that starts with `=` as a command name. Rule: Quote each argument that starts with `=`.

2026-11-14: AGENTS.md used idioms, filler words and rules that were not commands. Rule: Before you commit a doc, check it against each STE rule in AGENTS.md.

2026-11-14: AGENTS.md stated an STE rule that did not match the STE FAQ. Rule: Compare each STE rule with asd-ste100.org before you write it.

2026-11-14: WebFetch got HTTP 403 from asd-ste100.org. Rule: Use `curl -sL` to read that site.

2026-11-14: A subagent could not start its own subagents. Rule: The parent agent starts every reviewer and validator.
