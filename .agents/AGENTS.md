# AlphaOS Fitness Ecosystem — Custom Agent Rules

This document specifies rules and behavioral constraints for agentic assistants operating in this repository.

## Firestore Rules — Deploy Policy
- **SSOT:** `~/vitalos/firestore.rules` ist die einzige Source of Truth für alle Firestore-Rules des `fitness-aos` Projekts.
- **Niemals** einen `firestore`-Block zu `fitness-dev/firebase.json` hinzufügen.
- **Niemals** `firebase deploy --only firestore:rules` aus `fitness-dev` ausführen.
- Rules-Änderungen immer in `~/vitalos/firestore.rules` vornehmen und von dort deployen.

## Git Automation Policy
- **Auto-Commit**: After completing code changes, commit automatically without waiting for explicit instruction.
- **Never Auto-Push**: Never run `git push` automatically. Only push when the user explicitly asks (e.g., "push", "pushe").
- **Never Auto-Merge**: Never trigger the VitalOS submodule merge workflow automatically. Only execute it on explicit instruction.

## Git & Branching Workflow
- **Work in Branches**: Always perform tasks and feature development on a dedicated Git branch (e.g., `agent/<feature-name>`) instead of making edits directly on `master` or `main`.
- **Merge Preparation**: Prepare branches cleanly for user review, so the user can easily merge them without conflicts.
- **Commit Authorship**: When committing changes, identify yourself clearly as the AI assistant to distinguish changes from other tools (like Claude Code) by specifying the agent author:
  ```bash
  git commit -am "<msg>" --author="Antigravity <antigravity@gemini.team>"
  ```

## Monorepo / Micro-App Dependency Management
- **Align Dependency Versions**: When updating or testing `package.json` files in subdirectories (such as `cloud_chamber/journal-dev`), do not use `*` wildcards. Check the root [package.json](file:///home/alpha/fitness-dev/package.json) first and copy working version pins (e.g., for `vite`, `react`, and plugin packages) to avoid dependency conflicts during `npm install`.

## Worktree Workspace
- **Use Worktree Workspace**: To avoid workspace and checkout conflicts with Claude Code or the user, the agent (Antigravity) must run all terminal commands and perform all file edits inside the Git worktree located at `/home/alpha/fitness-dev/.worktrees/antigravity` instead of `/home/alpha/fitness-dev`.
  - **Verification**: Always verify that the `Cwd` parameter on terminal commands and `TargetFile` paths in file-edit tools point inside the `/home/alpha/fitness-dev/.worktrees/antigravity` directory tree.

## VitalOS Submodule Sync Workflow
When developing features in the VitalOS ecosystem (which uses Git Submodules for its micro-frontends like `fitness-dev`, `fuel-dev`, etc.), follow this exact sync procedure when finalizing a feature:
1. **Develop locally**: Do your work in the respective worktree (e.g., `/home/alpha/fitness-dev`) on the `dev` branch.
2. **Commit and Push (Worktree)**: Commit your changes and push the `dev` branch to origin.
3. **Merge to Master (Submodule)**: Change directory to the actual submodule inside the parent repo (e.g., `/home/alpha/vitalos/fitness-dev`), checkout `master`, merge the `dev` branch via fast-forward (`git merge origin/dev`), and push `master`.
4. **Update Parent Repo**: Change directory to the parent repo (`/home/alpha/vitalos`), run `git add <submodule-name>`, commit the updated pointer (`chore(submodules): update <submodule> pointer`), and push `master` to trigger the build/deploy hook.
