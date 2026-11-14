# Learnings

This is a live log of mistakes by agents and subagents. Each entry gives the rule that prevents the mistake.

- Read this log before you start work.
- After a mistake, add an entry at the top of the log.

Entry format, one or two lines:

`YYYY-MM-DD: <what went wrong>. Rule: <the rule that prevents it>.`

## Log

2026-11-14: The user said "launch the app". The parent agent started the Android emulator, but the user meant the site. Rule: In this project, "the app" and "the web app" mean the site, unless the user names the Android app. If you are not sure, ask.

2026-11-14: The parent agent opened the site in the browser while work was not done. The user wants the site open only when the whole task is done. Rule: Start the site dev server and open the site only when the whole task is done.

2026-11-14: A fixer wrote a docs commit subject that read like a change to a rule: "Put … under CC BY-SA 4.0". Another fixer wrote subjects that told less than the diff, or that used a word that is not STE. AGENTS.md used idioms, filler words and rules that were not commands. A list of instructions put a condition and its action in different bullets. Rule: Before you commit, compare the subject with the full diff. In the subject of a docs commit, say what the doc states. Before you commit a doc, check the doc and its commit subject against each STE rule in AGENTS.md. In a list of instructions, keep each condition and its action in the same bullet.

2026-11-14: A fixer inserted a sentence. Then the pronoun "It" in the next sentence pointed to the wrong noun. Rule: After you insert a sentence, read the next sentence again. Check each pronoun.

2026-11-14: A test assumed that each font URL in the built CSS is a file. Vite puts small fonts inline as data URLs. Rule: Before you assert on build output, read the build output.

2026-11-14: A reviewer read a file in parallel with the command that wrote it. A subagent ran a pypdf script in parallel with the check for pypdf. The script failed. Rule: Start a call only after each call whose result it needs ends. On this machine, `gs -sDEVICE=txtwrite` extracts text from a PDF.

2026-11-14: Agents parsed a bundled JS theme file as JSON. A regex missed text, because the theme was a JS string with `\"` escapes. Rule: Before you parse or search a file, print its first lines and check its format.

2026-11-14: Agents guessed package paths and the GitHub repo slug. An agent ran `ls` on `@astrojs/starlight/components` as a file path. The `exports` key `./components` of the package maps to `./dist/components.ts`. Rule: To find a file in a package, use `find` or read the `exports` of the package. Read the repo slug from `git remote -v`.

2026-11-14: A validator called a tool that the session does not have (Glob). Rule: Call only the tools that the session lists.

2026-11-14: The HTML-to-text script of a reviewer dropped a column of a table. Rule: After you convert an HTML table to text, make sure that each column has values.

2026-11-14: A reviewer searched the AGP jar for `setIsDefault`. Kotlin names that setter `setDefault`. Rule: Search a jar for the Kotlin property name, not for a guessed accessor name.

2026-11-14: In several agents, the Read tool showed "body elided" with a `<<ccr:…>>` marker. One agent used the partial output as the full file. Rule: If any tool output shows "body elided" with a `<<ccr:…>>` marker, call the `caveman_retrieve` tool with the handle in the marker. Before you say that a file is complete, compare its line count with the output of `wc -l`.

2026-11-14: A reviewer ran `astro build --root <dir>` from the repo root. Astro wrote `.astro/.prerender` into the main checkout. Rule: Run `astro build --root <dir>` from a working directory that contains `<dir>`. If `outDir` is not in the working directory, Astro writes `.astro/.prerender` into the working directory.

2026-11-14: A stale Astro content cache made a build test pass incorrectly. Rule: When you build a fixture, pass `--force` to `astro build`.

2026-11-14: A writer used a union content schema. The build printed "Unrecognized keys" and did not name the invalid field. Rule: Before you use a union content schema, build an invalid entry and read the error.

2026-11-14: A writer put the main manifest of the app in `src/launchPath/`, so the build failed. Rule: Put the main manifest of an Android app in `src/main/AndroidManifest.xml`.

2026-11-14: In many subagents, a hook changed each Bash call to the form `caveman shrink -- <command>`. Auto mode refused the first call and asked the agent to send the changed input again. One small-model subagent stopped there and did not commit its work. Rule: If auto mode asks you to send a changed input again, send that exact input one time in its own call. If auto mode refuses it again, do not send it again. Do the other tasks, and report the exact message.

2026-11-14: A fixer wrote a proof result in a commit message before it ran the proof. Another fixer put an unchecked fact in a commit body. Rule: Before you write a proof result in a commit message, run the proof. Put only checked facts in a commit message.

2026-11-14: A version sort key compared numbers with text, so the Python script failed. Rule: In a version sort key, make each part a tuple with a type flag.

2026-11-14: A reviewer looked for `isDefault` in `ProductFlavor.kt`. The property is in `ApplicationProductFlavor.kt`. Rule: Before you say that a property is missing, search the parent and the app-specific AGP DSL interfaces.

2026-11-14: A test that depends on the JDK ran on JDK 17, because the user-level `org.gradle.java.home` points to JDK 17. Rule: Before you run a test that depends on the JDK, run `gradlew --version` and read the "Daemon JVM" line.

2026-11-14: A reviewer used `val x by tasks.registering`. Gradle 9.6 and later deprecate this form. Rule: To register a task, write `val x = tasks.register("x") { }`.

2026-11-14: In a `.gradle.kts` script, `java.util.zip.ZipFile` failed, because `java` resolves to the `java` extension. Rule: In a Gradle Kotlin DSL script, import JDK classes.

2026-11-14: The parent agent did not start the validator for the staff review of the site. A wrong claim reached a fixer: "Starlight checks its options only during astro build". `astro check` runs the same hook. The fixer found the error. Rule: Before a fixer gets the findings of a review, run the validator on them. Do this for each review.

2026-11-14: In an STE rewrite, a writer dropped the words "maps … to" from a table row. Rule: Before you commit a rewrite, compare each old line with its new line, fact by fact.

2026-11-14: A writer put new pipeline steps after Edit. This broke the rule that Edit and Merge are one pass. Rule: Before you insert a step in a sequence, read each sentence that names the steps around it.

2026-11-14: The parent agent gave the fix text `curl -sL '<url>?format=TEXT'` for Gitiles. The URL had a `#<line>` anchor, so curl sent no query and got HTML. Rule: Before you add `?format=TEXT` to a Gitiles URL, remove the `#` anchor.

2026-11-14: Several agents ran many commands in one shell call. The output was mixed, or the output compressor cut it. One search printed 43 KB. Expected failures of a whole-page assertion printed the full HTML page (about 5,000 tokens) three times. Rule: Run one command for each output that you need. Limit each output to the lines that you need. If you expect an assertion on a large value to fail, run only that test, and cut the output to the error line.

2026-11-14: A fixer used `grep` in Bash to search one small file. A hook changed the command. Rule: To search one small file, use the Read tool.

2026-11-14: In an isolated git worktree, a guard refused long compound shell commands, for example `cd`, a heredoc and `gradle` in one command. A hook refused `git add` and `git commit` in one call. Two subagents had these refusals. Rule: In a worktree, run each shell command alone with absolute paths. Write files with the Write tool. Send each git command in its own call.

2026-11-14: The parent agent and a fact checker parsed the output of `npm view <pkg> time --json` as a JSON object. npm 12 printed a list, so the parse failed. Rule: Before you parse `npm view --json` output, check if it is a list.

2026-11-14: The parent agent gave a fixer a condition-first rewrite of a rule. The rewrite changed an absolute ban on a Co-Authored-By line to a ban that applied only if a system message asked for the line. Rule: If you reorder a sentence for STE, keep its meaning. Keep an absolute rule absolute.

2026-11-14: The writer of /doc-review stated one logged event as a general tool limit: "A subagent cannot start its own subagents." The Claude Code docs say that a subagent can start subagents, up to three layers below the main conversation ([sub-agents](https://code.claude.com/docs/en/sub-agents)). The bd setting `hierarchy.max-depth` is 3, so an agent cut the top epic from a bead tree with four levels. The cut was not necessary. Depth 3 lets a root have three levels of children. bd 1.3.2 does not enforce the setting. A reviewer reported the behavior of `adb shell ps` from memory, and the report was wrong. Rule: Before you state a tool limit as a rule or change a design for it, check the limit in the docs or the source of the tool, or test the limit. Before you report the behavior of a tool, read its source or docs, or run it. For Android platform code, read the source at the AOSP tag of the baseline.

2026-11-14: A subagent downloaded the STE Issue 9 PDF from Zenodo and did not keep it. The parent agent downloaded it again. Zenodo gave HTTP 403 ("unusual traffic"), so the parent agent could not check the quotes. A fixer saved downloaded HTML pages in the root of the scratch directory. Rule: Each time that you download files, save them in a new, empty directory in the session scratch directory. Report the path of each file. If a saved copy exists, do not download the file again.

2026-11-14: In the Bash tool shell, `grep` is `ugrep`. A pattern with several bounded repeats (for example three `[^<]{0,80}`) failed with "exceeds complexity limits". One bounded repeat passes. Rule: For a complex pattern, use Python `re`.

2026-11-14: A subagent guessed page paths on asd-ste100.org, for example `/faq` and `/rules`. Each path gave HTTP 404. Rule: Get page links from the home page. The pages are files, for example `STE_faq.html` and `about_STE.html`.

2026-11-14: `bd ... --json` output does not include empty fields. Code that read the `dependencies` key failed. An agent saw no `notes` key in some rows and almost missed the notes. Rule: Read optional fields in `bd ... --json` output with a default value.

2026-11-14: An output compressor dropped many near-identical output lines, so a step ran two times. An agent printed 14 similar lines. The compressor dropped them, and the Read tool also dropped them. Another agent printed all matches before it sliced them. Rule: Before you print repeated lines, join them onto one line, or group them into a count and a pattern. Slice matches before you print them. The Read tool does not show the dropped lines. To get the dropped lines, call the `caveman_retrieve` tool with the handle in the `<<ccr:…>>` marker.

2026-11-14: `bd` found no database when it ran from the scratch directory. Rule: Run `bd` from the repo root. Write output files by absolute path.

2026-11-14: In zsh, `bd show $ids` gave empty output. Zsh does not split a variable into words. Rule: In zsh, pass a list of ids with `${=ids}` or through `xargs`.

2026-11-14: By default, `bd list` returns only 50 rows, so an export almost missed issues. Rule: If you export or check issues, pass `--limit 0` to `bd list` and `bd ready`. By default, `bd list` also hides closed issues. To include them, pass `--all`.

2026-11-14: An agent searched inside a binary before it read the `--help` of the binary. Agents passed flags that a tool does not have: the GNU `find` flag `-fprint` on macOS, `--output=/dev/null` to `gradlew`, and guessed `bd` flags. Rule: Before you probe a binary, read its `--help`. Before you pass a flag that you have not used in this repo, read the `--help` of the tool. If you must search a binary, use fixed-string `grep -F`. Set a timeout on the shell tool call. macOS has no `timeout` command.

2026-11-14: `bd init` without `--stealth` wrote a block into AGENTS.md, tool files (`.claude/settings.json`, `.codex/`, `.cursor/`, `.agents/`) and extra lines into `.gitignore`. In this repo, `bd init --stealth` wrote only lines into `.git/info/exclude`. Rule: This repo uses beads stealth mode. Prefer `bd init --stealth` to `bd init`. Run `git status` before and after init. Revert each file that init changed. Delete each file that init added.

2026-11-14: Each `bd create` failed because the beads DB was only half initialized. Rule: Before the first `bd create` in a workspace, run `bd info` and `bd config get issue_prefix`. If the prefix is not set, do not run `bd create`.

2026-11-14: In zsh, `echo ======` failed two times, one time in the parent agent. Zsh reads a word that starts with `=` as a command name. Two fixers passed unquoted arguments with glob characters, for example `--include=*.js` and `--format=...[...]`. Zsh failed. Rule: In zsh, quote each argument that starts with `=` or that has `[`, `]`, `*` or `?`.

2026-11-14: AGENTS.md stated an STE rule that did not match the STE FAQ. Rule: Compare each STE rule with asd-ste100.org before you write it.

2026-11-14: WebFetch got HTTP 403 from asd-ste100.org. Rule: Use `curl -sL` to read that site.

2026-11-14: In one run, a subagent could not start its own subagents. Rule: Follow AGENTS.md rule 6.
