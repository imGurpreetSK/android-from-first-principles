# Learnings

This is a live log of mistakes by agents and subagents. Each entry gives the rule that prevents the mistake.

- Read this log before you start work.
- After a mistake, add an entry at the top of the log.

Entry format, one or two lines:

`YYYY-MM-DD: <what went wrong>. Rule: <the rule that prevents it>.`

## Log

2026-11-14: A staff reviewer put an HTML comment in the markup of an `.astro` file, and Astro wrote the comment into the built page. The Astro docs say that HTML comments go into the browser DOM, and that Astro removes JS comments. Rule: In an `.astro` file, write each comment in the frontmatter or as `{/* */}`.

2026-11-14: A staff reviewer called a deferred tool (`caveman_retrieve`) with a wrong parameter name. The schema of the tool was not loaded. Rule: Before the first call to a deferred tool, load its schema with ToolSearch.

2026-11-14: A staff reviewer ran an inline `python3 -c` script, and the script had a syntax error. Rule: Write a Python script of more than one line to a file in the session scratch directory with the Write tool. Then run the file.

2026-11-14: A staff reviewer ran a build on JDK 26. Gradle took `:build-logic:test` from the build cache, so the run proved nothing. Rule: If a run must prove that a test passes on a given JDK, pass `--rerun-tasks`. Then check that the test task ran.

2026-11-14: A staff reviewer searched a Gradle `--info` log, and the matches printed full classpath lines. The output was about 5,000 tokens. Rule: Before you print lines of a Gradle `--info` log, cut each line to a fixed width, for example with `cut -c1-200`.

2026-11-14: A fixer printed the full `gradlew --help` to check one flag. The fixer also ran the samples build without `-q`. The two outputs were about 5,000 tokens. Rule: Run `samples/gradlew -q -p samples build`. With `-q`, Gradle logs only errors. A pass prints nothing, or only the paths of the lint reports. To check one flag, save the help output to a file, and read only the line that you need.

2026-11-14: Two fact checkers gave an Astro root outside the worktree a `node_modules` symlink to `site/node_modules`. The default Astro `cacheDir` is `./node_modules/.astro`, so Astro wrote the page of a scratch root into `site/node_modules/.astro/data-store.json`. Rule: Do not link the `node_modules` of an Astro root to `site/node_modules`. To run the site tests of a commit outside the worktree, copy `node_modules` with `cp -cR`. To prove what a build does, use a fixture in `site/tests/fixtures/`, or read the Astro source.

2026-11-14: A validator wrote temporary files into a directory of saved pages. Rule: Write temporary files in a new directory in the session scratch directory. Do not write them into a directory of downloaded files.

2026-11-14: A validator searched a saved HTML spec page for `id="..."` and got no result. The page writes most ids without quotes, for example `id=the-details-element`. Rule: Before you trust a search with no result on saved HTML, check how the file writes the attribute.

2026-11-14: A test matched `<p>` with no attributes. A later scoped style added a class to the tag, and the test broke. A fact checker and a validator wrote a regex for built HTML from the component source. Astro adds a scoped class, for example `astro-hkc32dio`, at the end of the class attribute, so the regex failed. Rule: In a regex for built HTML, allow attributes on each tag, for example `<p[^>]*>`. For a class, write `class="<name>[ "]`. Run the regex on the built file before you propose it.

2026-11-14: A writer ran `shasum -c` from a directory that did not hold the listed files, so the check verified no file. `shasum -c` finds each relative path in the list from the current directory. Rule: Run `shasum -c` from the directory that holds the files. Make sure that the output says "OK" for each file.

2026-11-14: Two writers made a fixture use the site config, and the fixture build failed. Starlight resolves each `customCss` path that starts with `.` against the Astro root. The root of a fixture does not have the file. Rule: In an Astro config that a fixture uses, give each local `customCss` file as an absolute path. `site/astro.config.mjs` does this with `local()`.

2026-11-14: Four writers left built files in the `dist/` directory of a fixture, for example `site/tests/fixtures/go-deeper/dist/`. Then `astro check` checked the built JS and gave warnings. Rule: Build a fixture into a new temporary directory outside `site/`. Give the directory to `astro build` with `--outDir`. Delete the directory after the test.

2026-11-14: A writer wrote a regex for the Go deeper box. The regex also matched the mobile table of contents of Starlight, `<details id="starlight__mobile-toc">`. An earlier search with `.{0,300}` missed that element. Rule: Before you assert on build output, search the full file with a pattern that has no length limit.

2026-11-14: The user said "launch the app". The parent agent started the Android emulator, but the user meant the site. Rule: In this project, "the app" and "the web app" mean the site, unless the user names the launch app. If you are not sure, ask.

2026-11-14: The parent agent opened the site in the browser while work was not done. The user wants the site open only when the whole task is done. Rule: Start the site dev server and open the site only when the whole task is done.

2026-11-14: A fixer wrote a docs commit subject that read like a change to a rule: "Put … under CC BY-SA 4.0". Another fixer wrote subjects that told less than the diff, or that used a word that is not STE. AGENTS.md used idioms, filler words and rules that were not commands. A list of instructions put a condition and its action in different bullets. Rule: Before you commit, compare the subject with the full diff. In the subject of a docs commit, say what the doc states. Before you commit a doc, check the doc and its commit subject against each STE rule in AGENTS.md. In a list of instructions, keep each condition and its action in the same bullet.

2026-11-14: A fixer inserted a sentence. Then the pronoun "It" in the next sentence pointed to the wrong noun. A fixer cut text at the end of a file with the Edit tool. The cut also removed the final newline. Rule: After you insert a sentence, read the next sentence again. Check each pronoun. After you cut text at the end of a file, run `git diff` and look for "No newline at end of file".

2026-11-14: A test assumed that each font URL in the built CSS is a file. Vite puts small fonts inline as data URLs. Rule: Before you assert on build output, read the build output.

2026-11-14: A reviewer read a file in parallel with the command that wrote it. A subagent ran a pypdf script in parallel with the check for pypdf. The script failed. An agent ran `npm test` in parallel with `npm run check`. Rule: Start a call only after each call whose result it needs ends. Run the "Build and test" commands one after the other. They share `node_modules` and the build caches. On this machine, `gs -sDEVICE=txtwrite` extracts text from a PDF.

2026-11-14: Agents parsed a JS theme file as JSON. Agents parsed the list output of `npm view --json` as an object. A script dropped a column of an HTML table. Rule: Before you parse or search a file or a command output, print its first lines and check its format. After you convert an HTML table to text, make sure that each column has values.

2026-11-14: Agents guessed package paths and the GitHub repo slug. An agent ran `ls` on `@astrojs/starlight/components` as a file path. The `exports` key `./components` of the package maps to `./dist/components.ts`. Rule: To find a file in a package, use `find` or read the `exports` of the package. Read the repo slug from `git remote -v`.

2026-11-14: A validator called a tool that the session does not have (Glob). Rule: Call only the tools that the session lists.

2026-11-14: A reviewer searched the AGP jar for `setIsDefault`. Kotlin names that setter `setDefault`. A reviewer looked for `isDefault` in `ProductFlavor.kt`. The property is in `ApplicationProductFlavor.kt`. Rule: To list the members of a class in a jar, run `javap -cp <jar> <class>`. Before you say that a property is missing, check the parent and the app-specific AGP DSL interfaces.

2026-11-14: A reviewer ran `astro build --root <dir>` from the repo root. Astro wrote `.astro/.prerender` into the main checkout. An agent ran `npm --prefix site exec -- vitest run`. `npm exec` runs in the current directory, so Vitest skipped `site/vitest.config.ts`, and Astro wrote `.astro/` and `node_modules/` into the repo root. Rule: Run `astro build --root <dir>` from a working directory that contains `<dir>`. If `outDir` is not in the working directory, Astro writes `.astro/.prerender` into the working directory. To run a package script in `site/`, run `npm --prefix site test`, or run the script with `site/` as the working directory.

2026-11-14: A stale Astro content cache made a build test pass incorrectly. Rule: When you build a fixture, pass `--force` to `astro build`.

2026-11-14: A writer put the main manifest of the app in `src/launchPath/`, so the build failed. Rule: Put the main manifest of an Android app in `src/main/AndroidManifest.xml`.

2026-11-14: In many subagents, a hook changed each Bash call to the form `caveman shrink -- <command>`. Auto mode refused the first call and asked the agent to send the changed input again. One small-model subagent stopped there and did not commit its work. A fact checker sent two Bash calls in one response. The hook changed one call, and auto mode refused both calls. If an agent sends a Bash call in the changed form, auto mode accepts it on the first try, also with a second call in the same response. Rule: If a hook changes your Bash calls, copy the changed form from the first refusal message. Send each later Bash call in that form. If auto mode asks you to send a changed input again, send that exact input one time in its own call. If auto mode refuses it again, do not send it again. Do the other tasks, and report the exact message.

2026-11-14: A fixer wrote a proof result in a commit message before it ran the proof. Another fixer put an unchecked fact in a commit body. The parent agent put an unchecked fact in a fixer brief: "bold text gets weight 600". Bold text gets weight 700. Rule: Before you write a proof result in a commit message, run the proof. Put only checked facts in a brief and in a commit message.

2026-11-14: A test that depends on the JDK ran on JDK 17, because the user-level `org.gradle.java.home` points to JDK 17. Rule: Before you run a test that depends on the JDK, run `gradlew --version` and read the "Daemon JVM" line.

2026-11-14: A reviewer used `val x by tasks.registering`. Gradle 9.6 deprecates all Kotlin DSL property delegates. Rule: Do not use Kotlin DSL delegates (`by registering`, `by getting`, `by creating`, `by existing`, `by extra`). To register a task, write `val x = tasks.register("x") { }`.

2026-11-14: In a `.gradle.kts` script, `java.util.zip.ZipFile` failed, because `java` resolves to the `java` extension. Rule: In a Gradle Kotlin DSL script, import JDK classes.

2026-11-14: The parent agent did not start the validator for the staff review of the site. A wrong claim reached a fixer: "Starlight checks its options only during astro build". `astro check` runs the same hook. The fixer found the error. Rule: Before a fixer gets the findings of a review, run the validator on them. Do this for each review.

2026-11-14: In an STE rewrite, a writer dropped the words "maps … to" from a table row. Rule: Before you commit a rewrite, compare each old line with its new line, fact by fact.

2026-11-14: A writer put new pipeline steps after Edit. This broke the rule that Edit and Merge are one pass. Rule: Before you insert a step in a sequence, read each sentence that names the steps around it.

2026-11-14: The parent agent gave the fix text `curl -sL '<url>?format=TEXT'` for Gitiles. The URL had a `#<line>` anchor, so curl sent no query and got HTML. Rule: Before you add `?format=TEXT` to a Gitiles URL, remove the `#` anchor.

2026-11-14: Several agents ran many commands in one Bash call. The output was mixed, or the output compressor cut it. One search printed 43 KB. Expected failures of a whole-page assertion printed the full HTML page (about 5,000 tokens) three times. In an isolated git worktree, a guard refused long compound shell commands, for example `cd`, a heredoc and `gradle` in one command. A hook refused `git add` and `git commit` in one call. Two subagents had these refusals. A pipe to `head` or `tail` hid the exit code of npm. Another agent did not capture the exit code of a check. Rule: Run one command in each Bash call. Do not join commands with `;`, `&&`, `||` or a newline in one Bash call. In a worktree, use absolute paths. Write files with the Write tool. Limit each output to the lines that you need. Do not pipe the output of a command whose result you check. The Bash tool reports a non-zero exit code. If you expect an assertion on a large value to fail, run only that test, and cut the output to the error line.

2026-11-14: A fixer used `grep` in Bash to search one small file. A hook changed the command. Rule: To search one small file, use the Read tool.

2026-11-14: The parent agent gave a fixer a condition-first rewrite of a rule. The rewrite changed an absolute ban on a Co-Authored-By line to a ban that applied only if a system message asked for the line. Rule: If you reorder a sentence for STE, keep its meaning. Keep an absolute rule absolute.

2026-11-14: The writer of /doc-review stated one logged event as a general tool limit: "A subagent cannot start its own subagents." The Claude Code docs say that a subagent can start subagents, up to three layers below the main conversation ([sub-agents](https://code.claude.com/docs/en/sub-agents)). The bd setting `hierarchy.max-depth` is 3, so an agent cut the top epic from a bead tree with four levels. The cut was not necessary. Depth 3 lets a root have three levels of children. bd 1.3.2 does not enforce the setting. A reviewer reported the behavior of `adb shell ps` from memory, and the report was wrong. Rule: Before you state a tool limit as a rule or change a design for it, check the limit in the docs or the source of the tool, or test the limit. Before you report the behavior of a tool, read its source or docs, or run it. For Android platform code, read the source at the AOSP tag of the baseline. If you cannot start a subagent, report this to the parent agent. The parent agent starts each subagent (AGENTS.md rule 6).

2026-11-14: A subagent downloaded the STE Issue 9 PDF from Zenodo and did not keep it. The parent agent downloaded it again. Zenodo gave HTTP 403 ("unusual traffic"), so the parent agent could not check the quotes. A fixer saved downloaded HTML pages in the root of the scratch directory. An agent redirected output into a scratch directory that did not exist. Rule: Each time that you download files, save them in a new, empty directory in the session scratch directory. Before you write into a directory, create it. Report the path of each file. If a saved copy exists, do not download the file again.

2026-11-14: In the Bash tool shell, `grep` is a shell function that runs `ugrep`. A pattern with several bounded repeats (for example three `[^<]{0,80}`) failed with "exceeds complexity limits". One bounded repeat passes. If a hook changes a Bash call to `caveman shrink -- <command>`, caveman runs the macOS BSD `grep`, not the shell function. A pattern with `.{0,700}` failed there with "maximum repetition exceeds 255". Rule: For a complex pattern or a bounded repeat over 255, use Python `re`.

2026-11-14: AGENTS.md stated an STE rule that did not match the STE FAQ. A subagent guessed page paths on asd-ste100.org. Each path gave HTTP 404. WebFetch got HTTP 403 from the site. Rule: Before you write an STE rule, compare it with asd-ste100.org. Read that site with `curl -sL`. Get page links from the home page. The pages are files, for example `STE_faq.html` and `about_STE.html`.

2026-11-14: `bd ... --json` output does not include empty fields. Code that read the `dependencies` key failed. An agent saw no `notes` key in some rows and almost missed the notes. Rule: Read optional fields in `bd ... --json` output with a default value.

2026-11-14: An output compressor dropped many near-identical output lines, so a step ran two times. The Read tool showed "body elided" with a `<<ccr:…>>` marker. An agent used the partial output as the full file. WebFetch cut a long page at 100,000 characters. Rule: Before you print repeated lines, join them onto one line, or group them into a count and a pattern. Slice matches before you print them. The Read tool does not show the dropped lines. If any tool output shows "body elided" or drops lines, call the `caveman_retrieve` tool with the handle in the `<<ccr:…>>` marker. Before you say that a file is complete, compare its line count with the output of `wc -l`. If a fetch result says that the page is longer, fetch the rest, or save the page with `curl -sL` and search the file.

2026-11-14: `bd` found no database when it ran from the scratch directory. Rule: Run `bd` from the repo root. Write output files by absolute path.

2026-11-14: In zsh, `bd show $ids` gave empty output. Zsh does not split a variable into words. The Bash tool does not keep shell variables between calls. Rule: Pass each id as a separate argument: `bd show <id1> <id2>`.

2026-11-14: By default, `bd list` returns only 50 rows, so an export almost missed issues. Rule: If you export or check issues, pass `--limit 0` to `bd list` and `bd ready`. By default, `bd list` also hides closed issues. To include them, pass `--all`.

2026-11-14: An agent searched inside a binary before it read the `--help` of the binary. Agents passed flags that a tool does not have: the GNU `find` flag `-fprint` on macOS, `--output=/dev/null` to `gradlew`, and guessed `bd` flags. Rule: Before you probe a binary, read its `--help`. Before you pass a flag that you have not used in this repo, read the `--help` of the tool. If you must search a binary, use fixed-string `grep -F`. A jar is compressed. `grep` does not find text in its classes. Set a timeout on the Bash call. macOS has no `timeout` command.

2026-11-14: `bd init` without `--stealth` wrote into AGENTS.md, tool files and `.gitignore`. Each `bd create` failed, because the beads database was only half initialized. Rule: This repo uses beads stealth mode. Prefer `bd init --stealth` to `bd init`. Run `git status` before and after init. Revert each file that init changed. Delete each file that init added. Before the first `bd create` in a workspace, run `bd info` and `bd config get issue_prefix`. If the prefix is not set, do not run `bd create`.

2026-11-14: In zsh, `echo ======` failed two times, one time in the parent agent. Zsh reads a word that starts with `=` as a command name. Two fixers passed unquoted arguments with glob characters, for example `--include=*.js` and `--format=...[...]`. Zsh failed. Rule: In zsh, quote each argument that starts with `=` or that has `[`, `]`, `*` or `?`.
