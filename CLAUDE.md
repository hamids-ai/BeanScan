# BeanScan - Claude Instructions

## Development Status Tracking

At the start of each session, read `docs/Development_Status.md` to understand where the project left off. Also read `docs/Tech_Architecture.md` for system architecture context.

Before making any changes to `supabase/functions/lookup-coffee/index.ts`, read `docs/lookup-coffee-function-decisions.md` first. 

Follow the coding standards in `docs/CODING_STANDARDS.md`.

## Document Maintenance

When an explicit product requirement changes, update `docs/BeanScan_Product_Spec.md` and increment the version number and changelog at the bottom of the file.

### When to update each technical document

**`docs/Tech_Architecture.md`** — update when the *shape or behavior* of the system changes: phase order, merge logic, source tagging, UX requirements, new phases, new fields, or any architectural decision. Answers: *"How does the system work?"* Do NOT update it for implementation-level details.

**`docs/lookup-coffee-function-decisions.md`** — update when *implementation mechanics* change: how a helper function works, why a specific threshold or heuristic was chosen, known issues, scoring logic, edge cases, or anything a developer needs to know before editing the function. Answers: *"Why is the code written this way?"* Do NOT duplicate architectural descriptions already in Tech_Architecture.md.

## DIRECTIVES

* Simpler is always better. Do not over-engineer.

* When the user presents you with an error message, the intent is to prevent the error from happening and not to make the error message or error handling better. Unless the user specifically asks to improve error handling of message, never assume that to be the case.

* Don't make assumptions on design items. Ask the user for input and propose options.

* Never push to Git any sensitive information like my API keys, passwords, etc.

* Show plan before execution. Before implementing any new code or fixing code, share your plan first in simple human readable instructions so I can review and approve.

## Installation & Download Safety

Before installing any package, dependency, or tool (via pip, npm, brew, 
apt, curl, wget, etc.) or downloading any file from the internet, STOP 
and ask for explicit confirmation. Do not proceed until I approve.

When requesting confirmation, begin your message with:
⚠️ INSTALL / DOWNLOAD REQUEST

Include:
- What is being installed or downloaded
- Why it is needed
- The exact command you intend to run

