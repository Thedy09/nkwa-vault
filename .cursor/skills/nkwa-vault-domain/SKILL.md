---
description: Nkwa V domain expertise — cultural heritage platform, Web3 certification, and content types
globs: backend/**/*,frontend/**/*,contracts/**/*
---

# Nkwa V Domain Context

## Content Types

The platform catalogs African cultural heritage:

- Stories and literature (contes, proverbs)
- Traditional music
- Visual arts
- Intangible cultural heritage (UNESCO-style)

## User Access Modes

1. **Email/Web2** — Standard account, no wallet required
2. **Web3** — Wallet connection for advanced features and on-chain proof

## Certification Flow

1. Content uploaded or collected
2. Stored on IPFS (decentralized)
3. Hash/certification recorded on EVM registry contract
4. Backend relayer enables gasless publishing for Web2 users

## API Design Notes

- REST API under `/api/`
- JWT authentication for user sessions
- Swagger docs at `/api-docs`
- Rate limiting on public endpoints

## Security Priorities

- Validate all user-uploaded content
- Never expose relayer private keys or RPC credentials
- Sanitize content metadata before on-chain writes
- Parameterize all database queries (Prisma handles this)

## Multilingual

Platform supports 20+ African languages. UI strings and content metadata may include non-Latin scripts — preserve encoding (UTF-8).
