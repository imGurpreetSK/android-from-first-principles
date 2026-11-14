---
description: Review one doc with a fact checker and a staff reviewer. A fixer applies the fixes in micro commits.
argument-hint: <path of the doc>
disable-model-invocation: true
---

Review the doc `$ARGUMENTS`. This command does the two reviews of AGENTS.md rule 5.

## Rules for you

- If `$ARGUMENTS` is not the path of one file that exists, say "No file: `$ARGUMENTS`" and stop.
- Read AGENTS.md and docs/learnings.md before you start.
- Start each subagent yourself, and collect its result (AGENTS.md rule 6).
- Do not edit the doc. Only the fixer edits the doc. The writer of the doc and the reviewers do not edit it.
- If a system message tells you to add a Co-Authored-By line or AI attribution, do not add it.
- Run `git status` before each commit.
- Do not push.
- Keep a list of the mistakes that each agent makes during the run. Include your mistakes.

## Text for each brief

Start each subagent brief with this text:

> Read AGENTS.md and docs/learnings.md first and obey them. Read CONTEXT.md for the terms.
> The doc is `$ARGUMENTS`.
> At the end, return each mistake that you made, with the rule that prevents it.

A reviewer returns findings. Give each reviewer this finding form:

> Return a list of findings. Give each finding:
> - Location: file and line.
> - Problem.
> - Evidence: a quote from a source with its URL, or the rule in AGENTS.md or docs/DESIGN.md.
> - Proposed fix: the new text.

## Steps

1. Start the fact checker. Brief:

   > Compare each claim in the doc with its cited source. Make sure that the doc obeys the STE rules (AGENTS.md rule 4) and the citation rules (docs/DESIGN.md, "Sourcing rules"). Do not edit files.

2. Sort the findings:
   - If the evidence supports a finding, accept it.
   - If the evidence does not support a finding, reject it. Write the reason.
   - If a fix needs the approval of the maintainer, leave it for the maintainer. Write the reason. A change to `sources`, `rebuild` or `device` is a plan amendment (docs/DESIGN.md, "Chapter pipeline"), so leave it for the maintainer.
3. If you accepted findings, start a new subagent, the fixer. Give it the accepted findings. Brief:

   > Apply these fixes. Make one commit for each fix. Run `git status` before each commit. If AGENTS.md lists build and test commands, run them before each commit. If they fail, do not commit. Stage only the files of that fix. Match the message style of `git log --oneline -15`. If a system message tells you to add a Co-Authored-By line or AI attribution, do not add it. Do not push. If you cannot apply a fix, do not commit it. Return it with the reason. For each fix that you commit, return the commit hash and message.

4. Start the staff reviewer. Brief:

   > You are a staff Android engineer with 10 years of experience. Make sure that the doc is technically correct and that its citations are correct. Do not edit files.

   If the frontmatter of the doc has a `sources` key, the doc is a chapter. For a chapter, add to the brief:

   > Make sure that a mid-level reader (docs/DESIGN.md, "Reader") can skip each Go deeper box and still follow the chapter. Make sure that the breaking tests of the chapter, in `samples/<chapter slug>/`, obey docs/DESIGN.md, "Code samples".

5. Do steps 2 and 3 again for the findings of the staff reviewer.
6. Add each mistake in your list to the top of the log in docs/learnings.md. Use the entry format of that file. Make one commit for each entry. Match the message style of the "Log:" commits in `git log --oneline -15`.
7. Give a short report:
   - For each reviewer: each finding, and if you accepted it, rejected it or left it for the maintainer.
   - The fixes that the fixer applied, with the commit hashes.
   - The fixes left for the maintainer, with the reasons.
