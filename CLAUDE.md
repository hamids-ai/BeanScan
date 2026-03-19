# BeanScan - Claude Instructions

## Development Status Tracking

At the start of each session, read `docs/Development_Status.md` to understand where the project left off. Also read `docs/Tech_Architecture.md` for system architecture context.

Throughout the session, keep this file updated with:
- Date format: MM.DD.YYYY (e.g., 03.09.2026)
- Maximum 5 bullet points per day (each max 280 characters)
- Content: key achievements, git commit status, suggested next steps
- Write at a high level (what was accomplished, not technical implementation details)

At the end of each session or when committing to git, consolidate and update the current day's bullets. Never modify entries from previous days.

This file is local only (listed in .gitignore) and should never be committed.

Follow the coding standards in `docs/CODING_STANDARDS.md`.

## Document Maintenance

When an explicit product requirement changes, update `docs/BeanScan_Product_Spec.md` and increment the version number and changelog at the bottom of the file.

When a significant technical architecture decision changes, update `docs/Tech_Architecture.md` accordingly.

## DIRECTIVES

* Simpler is always better. Do not over-engineer.

* When the user presents you with an error message, the intent is ALMOST CERTAINLY to prevent the error from happening and not to make the error message or error handling better. Unless the user specifically asks to improve error handling of message, never assume that to be the case.

* Don't make assumptions on design items that could benefit from the user's input. Ask the user for input and propose options.

* Never push to Git any sensitive information like my API keys, passwords, etc.

