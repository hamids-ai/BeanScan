# BeanScan - Claude Instructions

## Development Status Tracking

At the start of each session, read `docs/Development_Status.md` to understand where the project left off. Also read `docs/Tech_Architecture.md` for system architecture context.

Before making any changes to `supabase/functions/lookup-coffee/index.ts`, read `docs/lookup-coffee-function-decisions.md` first.

Follow the coding standards in `docs/CODING_STANDARDS.md`.

## Document Maintenance

When an explicit product requirement changes, update `docs/BeanScan_Product_Spec.md` and increment the version number and changelog at the bottom of the file.

When a significant technical architecture decision changes, update `docs/Tech_Architecture.md` accordingly.

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

