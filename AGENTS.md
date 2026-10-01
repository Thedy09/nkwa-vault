# AGENTS.md

Guidance for AI coding agents working in **Nkwa V** (`nkwa-vault`).

## Repository Overview

Nkwa V is a Web3 platform for preserving and certifying African cultural heritage. It combines a React frontend, Node.js/Express backend, PostgreSQL (Prisma), and EVM blockchain + IPFS for on-chain certification and decentralized storage.

## Agent Skills

This project uses [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills), installed under `.agents/skills/`. Cursor discovers them automatically.

### Lifecycle Mapping

| Phase | Skill(s) |
|-------|----------|
| Define | `interview-me`, `idea-refine`, `spec-driven-development` |
| Plan | `planning-and-task-breakdown` |
| Build | `incremental-implementation`, `test-driven-development`, `frontend-ui-engineering`, `api-and-interface-design` |
| Verify | `browser-testing-with-devtools`, `debugging-and-error-recovery` |
| Review | `code-review-and-quality`, `security-and-hardening`, `performance-optimization` |
| Ship | `git-workflow-and-versioning`, `ci-cd-and-automation`, `shipping-and-launch` |

### Core Rules

- If a task matches a skill, follow that skill's workflow — do not skip steps.
- Start with `using-agent-skills` when unsure which skill applies.
- For Web3/blockchain work, also apply `security-and-hardening`.
- For UI changes, also apply `frontend-ui-engineering`.
- For API changes, also apply `api-and-interface-design`.

Invoke skills manually with `/skill-name` in Agent chat (e.g. `/test-driven-development`, `/code-review-and-quality`).

## Commands

```bash
npm run dev              # Start backend + frontend
npm test                 # Run backend and frontend tests
npm run lint             # Lint both packages
npm run build            # Build frontend
npm run db:migrate       # Prisma migrations
npm run db:generate      # Regenerate Prisma client
```

Backend-only: `cd backend && npm run dev`
Frontend-only: `cd frontend && npm start`

## Boundaries

- Never commit `.env` files, private keys, or relayer credentials.
- Never modify Prisma schema without a migration.
- Ask before adding new npm dependencies.
- Web3 config lives in `backend/.env` — see `WEB3_SETUP_GUIDE.md`.
- Smart contracts are in `contracts/` (Vyper).

## Specialist Personas

For targeted reviews, apply these frameworks from `.cursor/agents/`:

| Persona | Use When |
|---------|----------|
| `code-reviewer` | Pre-merge code review |
| `security-auditor` | Auth, Web3, user input, secrets |
| `test-engineer` | Test strategy and coverage |
| `web-performance-auditor` | Frontend performance audit |

## Updating Skills

```bash
npx skills update addyosmani/agent-skills
```
