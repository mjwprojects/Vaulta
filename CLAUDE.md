# Project Claude Instructions

@.claude/project/PROJECT_BRIEF.md
@.claude/project/ARCHITECTURE.md
@.claude/project/ROADMAP.md
@.claude/project/DECISIONS.md

## Project workflow

1. Read this file and the imported project files first.
2. Confirm objective and current state before edits.
3. Propose the smallest safe next change.
4. After edits, run the documented verification commands.
5. Update `DECISIONS.md` and `HANDOVER.md` when material changes are made.

## Local safety

- Do not expose secrets.
- Do not run destructive database commands.
- Do not overwrite user content without checking diffs.
- Do not change deployment settings without approval.
