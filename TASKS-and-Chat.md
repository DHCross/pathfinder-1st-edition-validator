# Using Taskfile Tasks While Pairing with Cascade

This repo includes a `Taskfile.yml` so you can quickly run common project workflows from the command line.
When you are working in chat with Cascade, these tasks make it easy to:

- Reproduce issues Cascade is reasoning about
- Run checks Cascade suggests (tests, lint, builds)
- Verify that new changes behave as expected
- Keep a clean, fast feedback loop without remembering long npm commands

---

## Core Tasks

All commands below assume you are in the project root:

```bash
cd pathfinder-1st-edition-validator   # already implied in this workspace
```

### `task dev`

Runs the TypeScript compiler in watch mode (equivalent to `npm run dev`).

**Use it when:**

- You and Cascade are iterating on TypeScript logic or rule engines
- You want instant feedback on type errors while editing

**In chat you might say:**

> "I’ll start `task dev` so we can see any type errors as we tweak the validator. Tell me when to re-run tests."

### `task storybook`

Starts Storybook on port 6006 (equivalent to `npm run storybook`).

**Use it when:**

- You’re working with Cascade on UI changes (Rules Lawyer, Bestiary Architect, etc.)
- You want to visually confirm the behavior of components Cascade edits

**In chat you might say:**

> "I’m running `task storybook` now; which story should I look at to verify this change?"

### `task dev:all`

Runs both `dev` and `storybook` (via dependencies) so that types and UI stories are live together.

**Use it when:**

- You are doing UI and validation logic changes at the same time
- You want Storybook and the TS watcher running without starting two separate commands

**In chat you might say:**

> "I’ll run `task dev:all` while we refactor Rules Lawyer so I can see both type errors and Storybook updates."

---

## Quality and CI Tasks

### `task check`

Runs lint, tests, and build in sequence:

```bash
task check   # == task lint → task test → task build
```

**Use it when:**

- You and Cascade have just completed a feature / refactor
- You want to confirm the project is healthy before committing or pushing

**In chat you might say:**

> "I’ll run `task check` now; if anything fails, help me interpret the output."

### `task ci`

Alias for `task check`. Good mental model for “what CI would do.”

**Use it when:**

- You want to simulate your CI pipeline locally

### `task test`

Runs the Vitest suite (`npm test`).

**Use it when:**

- Cascade has added or modified tests
- You want to isolate test failures before doing a full `check`

**In chat you might say:**

> "I’ll run `task test` and paste the failing test output here for you to analyze."

### `task lint`

Runs ESLint on the codebase (`npm run lint`).

**Use it when:**

- Cascade has just added or refactored code and you want style/quality checks
- You see editor lint warnings and want the full report

### `task format`

Runs Prettier formatting over the source (`npm run format`).

**Use it when:**

- You’ve made a lot of small edits (with or without Cascade) and want to normalize style

---

## Storybook Build Tasks

### `task storybook:build`

Builds a static Storybook bundle (`npm run build-storybook`).

**Use it when:**

- You want to deploy or share the component gallery
- You and Cascade are verifying that Storybook builds cleanly (no missing stories / imports)

---

## Housekeeping Tasks

### `task clean`

Removes build artifacts (`dist`, `storybook-static`).

**Use it when:**

- You suspect a stale build is causing weird behavior
- Cascade suggests "try a clean build" before debugging further

**In chat you might say:**

> "I’ll run `task clean` and then `task check` to see if a fresh build still fails."

---

## Typical Flows When Pairing with Cascade

### 1. Working on Rules Lawyer / UI Components

1. Start dev tools:
   - `task dev:all`
2. Ask Cascade to change or add stories/components.
3. Refresh Storybook and report back any visual or console issues.
4. When done, run `task check` before committing.

### 2. Debugging a Failing Test

1. Run `task test` and copy the failing output into chat.
2. Ask Cascade to help interpret the failure and propose code changes.
3. Re-run `task test` until it passes.
4. Optionally finish with `task check`.

### 3. Pre-Commit Sanity Pass

1. Run `task format` to normalize style.
2. Run `task check`.
3. If anything fails, paste the logs into chat and continue pairing.

---

## How to Reference Tasks in Chat

When you want Cascade to take tasks into account, it helps to be explicit. For example:

- "Assume I will run `task check` before pushing; keep changes small enough that this stays fast."
- "After you edit the validator, which single task should I run first to validate the change?"
- "If `task test` passes but `task check` fails, which part should I send you?"

This gives Cascade clear expectations about your workflow and keeps the loop between edits and verification tight.
