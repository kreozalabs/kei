---
trigger: always_on
---

# Git and Commit Message Guidelines

When generating commit messages or PR titles, always adhere to the following standards:

## 1. Conventional Commits

- Use the [Conventional Commits](https://www.conventionalcommits.org/) format.
- Common types: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.

## 2. Lowercase Convention

- **Subject Line:** Always use **lowercase** for the subject line.
- **Example:** `feat: add database maintenance tool` (Correct)
- **Example:** `feat: Add database maintenance tool` (Incorrect)

## 3. Pull Request Titles

- Apply the same lowercase convention to Pull Request titles.
- This ensures consistency when PR titles are used as squash-merge commit messages.

## 4. Tone and Structure

- Use the **imperative mood** (e.g., "add", "fix", "update" instead of "added" or "fixes").
- Do not end the subject line with a period.
- Keep the subject line under 72 characters if possible.
