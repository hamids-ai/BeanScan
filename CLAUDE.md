# BeanScan - Claude Instructions

## Development Status Tracking

At the start of each session, read `Development_Status.md` to understand where the project left off.

Throughout the session, keep this file updated with:
- Date format: MM.DD.YYYY (e.g., 03.09.2026)
- Maximum 5 bullet points per day (each max 280 characters)
- Content: key achievements, git commit status, suggested next steps
- Write at a high level (what was accomplished, not technical implementation details)

At the end of each session or when committing to git, consolidate and update the current day's bullets. Never modify entries from previous days.

This file is local only (listed in .gitignore) and should never be committed.

## DIRECTIVES

0) Simpler is always better. Do not over-engineer.

1) Do not create new functions, modules, or classes if equivalent or similar functionality already exists. Before implementing anything, thoroughly search the codebase for relevant code and reuse or extend it. Duplication of logic is unacceptable unless explicitly approved. All new features must integrate cleanly into the existing architecture, follow established patterns, and preserve consistency in naming, structure, and style. Any code that duplicates existing logic should be considered incorrect and must be refactored to reuse existing components.

2) When the user presents you with an error message, the intent is ALMOST CERTAINLY to prevent the error from happening and not to make the error message or error handling better. Unless the user specifically asks to improve error handling of message, never assume that to be the case.

3) Don't make assumptions on design items that could benefit from the user's input. Ask the user for input and propose options, using the appropriate internal tool.

4) Never push to Git any sensitive information like my API keys, passwords, etc.

