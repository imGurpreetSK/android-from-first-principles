# Learnings

This is a live log of mistakes by agents and subagents. Each entry gives the rule that prevents the mistake.

- Read this log before you start work.
- After a mistake, add an entry at the top of the log.

Entry format, one or two lines:

`YYYY-MM-DD: <what went wrong>. Rule: <the rule that prevents it>.`

## Log

2026-11-14: Several agents ran many commands in one shell call. The output was mixed, or the output compressor cut it. One search printed 43 KB. Rule: Run one command for each output that you need. Limit each output to the lines that you need.

2026-11-14: A fixer used `grep` in Bash to search one small file. A hook changed the command. Rule: To search one small file, use the Read tool.

2026-11-14: In an isolated git worktree, a guard refused long compound shell commands, for example `cd`, a heredoc and `gradle` in one command. A hook refused `git add` and `git commit` in one call. Two subagents had these refusals. Rule: In a worktree, run each shell command alone with absolute paths. Write files with the Write tool. Send each git command in its own call.

2026-11-14: The parent agent and a fact checker parsed the output of `npm view <pkg> time --json` as a JSON object. npm 12 printed a list, so the parse failed. Rule: Before you parse `npm view --json` output, check if it is a list.

2026-11-14: The parent agent gave a fixer a condition-first rewrite of a rule. The rewrite changed an absolute ban on a Co-Authored-By line to a ban that applied only if a system message asked for the line. Rule: If you reorder a sentence for STE, keep its meaning. Keep an absolute rule absolute.

2026-11-14: The writer of /doc-review stated one logged event as a general tool limit: "A subagent cannot start its own subagents." The Claude Code docs say that a subagent can start subagents, up to three layers below the main conversation ([sub-agents](https://code.claude.com/docs/en/sub-agents)). Rule: Before you state a tool limit as a rule, check the limit in the tool docs.

2026-11-14: A subagent downloaded the STE Issue 9 PDF from Zenodo and did not keep it. The parent agent downloaded it again. Zenodo gave HTTP 403 ("unusual traffic"), so the parent agent could not check the quotes. Rule: Save each file that you download in the session scratch directory. Report its path. If a saved copy exists, do not download the file again.

2026-11-14: In this shell, `grep` is `ugrep`. A pattern with the bounded repeat `[^<]{0,80}` failed with "exceeds complexity limits". Rule: For a complex pattern, use Python `re`.

2026-11-14: A subagent ran a pypdf script in parallel with the check for pypdf. The script failed. Rule: Before you run a command that needs a tool, make sure that the tool exists. On this machine, `gs -sDEVICE=txtwrite` extracts text from a PDF.

2026-11-14: A subagent guessed page paths on asd-ste100.org, for example `/faq` and `/rules`. Each path gave HTTP 404. Rule: Get page links from the home page. The pages are files, for example `STE_faq.html` and `about_STE.html`.

2026-11-14: `bd ... --json` output does not include empty fields. Code that read the `dependencies` key failed. An agent saw no `notes` key in some rows and almost missed the notes. Rule: Read optional fields in `bd ... --json` output with a default value.

2026-11-14: An output compressor dropped many near-identical output lines, so a step ran two times. Rule: Before you print repeated lines, group them into a count and a pattern. If output says that lines were elided, read the full text with a file read tool. For command output, write it to a file first.

2026-11-14: `bd` found no database when it ran from the scratch directory. Rule: Run `bd` from the repo root. Write output files by absolute path.

2026-11-14: In zsh, `bd show $ids` gave empty output. Zsh does not split a variable into words. Rule: In zsh, pass a list of ids with `${=ids}` or through `xargs`.

2026-11-14: By default, `bd list` returns only 50 rows, so an export almost missed issues. Rule: If you export or check issues, pass `--limit 0` to `bd list` and `bd ready`. By default, `bd list` also hides closed issues. To include them, pass `--all`.

2026-11-14: The bd setting `hierarchy.max-depth` is 3, so an agent cut the top epic from a bead tree with four levels. The cut was not necessary. Depth 3 lets a root have three levels of children. bd 1.3.2 does not enforce the setting. Rule: Before a tool limit changes a design, read the source of the tool or test the limit.

2026-11-14: AGENTS.md used idioms, filler words and rules that were not commands. A list of instructions put a condition and its action in different bullets. Rule: Before you commit a doc, check it against each STE rule in AGENTS.md. In a list of instructions, keep each condition and its action in the same bullet.

2026-11-14: An agent searched inside a binary before it read the `--help` of the binary. Rule: Before you probe a binary, read its `--help`. If you must search a binary, use fixed-string `grep -F`. Set a timeout on the shell tool call. macOS has no `timeout` command.

2026-11-14: `bd init` without `--stealth` wrote a block into AGENTS.md, tool files (`.claude/settings.json`, `.codex/`, `.cursor/`, `.agents/`) and extra lines into `.gitignore`. In this repo, `bd init --stealth` wrote only lines into `.git/info/exclude`. Rule: This repo uses beads stealth mode. Prefer `bd init --stealth` to `bd init`. Run `git status` before and after init. Revert each file that init changed. Delete each file that init added.

2026-11-14: Each `bd create` failed because the beads DB was only half initialized. Rule: Before the first `bd create` in a workspace, run `bd info` and `bd config get issue_prefix`. If the prefix is not set, do not run `bd create`.

2026-11-14: In zsh, `echo ======` failed two times, one time in the parent agent. Zsh reads a word that starts with `=` as a command name. Rule: Quote each argument that starts with `=`.

2026-11-14: AGENTS.md stated an STE rule that did not match the STE FAQ. Rule: Compare each STE rule with asd-ste100.org before you write it.

2026-11-14: WebFetch got HTTP 403 from asd-ste100.org. Rule: Use `curl -sL` to read that site.

2026-11-14: In one run, a subagent could not start its own subagents. Rule: Follow AGENTS.md rule 6.
