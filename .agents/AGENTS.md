# AlphaOS Fitness Ecosystem — Custom Agent Rules

This document specifies rules and behavioral constraints for agentic assistants operating in this repository.

## Git & Branching Workflow
- **Work in Branches**: Always perform tasks and feature development on a dedicated Git branch (e.g., `agent/<feature-name>`) instead of making edits directly on `master` or `main`.
- **Merge Preparation**: Prepare branches cleanly for user review, so the user can easily merge them without conflicts.
- **Commit Authorship**: When committing changes, identify yourself clearly as the AI assistant to distinguish changes from other tools (like Claude Code) by specifying the agent author:
  ```bash
  git commit -am "<msg>" --author="Antigravity <antigravity@gemini.team>"
  ```

## Worktree Workspace
- **Use Worktree Workspace**: To avoid workspace and checkout conflicts with Claude Code or the user, the agent (Antigravity) must run all terminal commands and perform all file edits inside the Git worktree located at `/home/alpha/fitness-dev/.worktrees/antigravity` instead of `/home/alpha/fitness-dev`.
