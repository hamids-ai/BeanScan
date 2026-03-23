Perform the following end-of-session wrap-up steps in order:

## Step 1 — Update Development_Status.md
- Read `docs/Development_Status.md`
- Add or update today's entry (date format: MM.DD.YYYY) with up to 5 bullets summarizing:
  - Key achievements from this session
  - Current git commit status
  - Suggested next steps for the next session
- Never modify entries from previous days
- Keep each bullet under 280 characters, written at a high level

## Step 2 — Identify what to commit
- Run `git status` to see all changed and untracked files
- Exclude anything listed in `.gitignore` (notably `docs/Development_Status.md`, `.env.local`, secrets)
- List the files you plan to commit and briefly explain why each one belongs in git

## Step 3 — Confirm with the user
- Show the proposed commit file list and a draft commit message
- Ask the user to confirm before proceeding

## Step 4 — Commit and push
- Once confirmed, stage the identified files, commit with an appropriate message, and push to the current branch
- Report the commit hash and confirm the push succeeded
