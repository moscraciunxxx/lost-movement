# AO Capabilities Used in Lost Movement

This document records the Agent Orchestrator (AO) surfaces that were used while
building and iterating on **Lost Movement / The Orchestra**.

## Desktop Kanban
The AO desktop board organized the work as cards moving across columns, giving a
single visual overview of what was queued, in progress, and done.

## Isolated Worktrees
Each session ran in its own git worktree, so parallel work stayed isolated and
branches never collided on a shared checkout.

## Claude Code Chat
Claude Code sessions drove implementation, edits, verification, and Git/PR
workflow from inside the worktree.

## Codex Chat
Codex chat sessions provided an alternate agent runtime for drafting and
reviewing changes alongside Claude.

## Orchestrator
An orchestrator session coordinated the work — spawning and redirecting worker
sessions and resolving cross-session decisions.

## AO Preview / In-App Browser
`ao preview` and the in-app Browser panel rendered the static museum UI and
supporting artifacts, and allowed live page inspection of the session-owned page.

## GitHub Issues
Provider issues on GitHub served as the tracked source of truth for
issue-backed tasks.

## Pull Requests
Feature branches within each session namespace opened pull requests via `gh`,
linking their provider issue where one existed.

## AO Review
`ao review` supplied automated review feedback on changes before merge.
