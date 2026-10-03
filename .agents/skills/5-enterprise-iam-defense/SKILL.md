---
name: 5-enterprise-iam-defense
description: Enterprise IAM defense-in-depth playbook covering Argon2id, HIBP k-anonymity, 2FA TOTP, WebAuthn Passkeys, and session deduplication.
---

# Skill 5: Enterprise IAM Defense-in-Depth

This skill outlines the enterprise security controls protecting user identities, credentials, and cryptographic sessions across the monorepo.

## 1. Password Hashing with Argon2id & Transparent Migration
All user passwords must be hashed using **Argon2id** configured with OWASP-recommended parameters:
- `type`: `argon2id`
- `memoryCost`: `19456` (19 MiB)
- `timeCost`: `2` iterations
- `parallelism`: `1` thread

### Transparent Legacy Migration:
When verifying passwords during authentication:
1. Detect whether the stored hash starts with `$2a$` or `$2b$` (legacy bcrypt) vs `$argon2id$`.
2. Verify using the appropriate algorithm.
3. If a legacy bcrypt hash matches successfully, immediately rehash the password with Argon2id and update the database record in the background without user interruption.

## 2. Have I Been Pwned (HIBP) k-Anonymity Verification
All password creation and update requests must be audited against known compromised breaches:
- **Hashing**: Compute SHA-1 of the candidate password in uppercase.
- **k-Anonymity**: Send only the first 5 characters (prefix) to `https://api.pwnedpasswords.com/range/{prefix}`.
- **Evaluation**: Match the remaining 35 characters locally against the returned suffix list. If breach count > 0, reject the password.
- **Fail-Open Policy**: If the HIBP network request times out or fails, log a security warning and fail-open to prevent denying valid service during external outages.

## 3. Multi-Device Tracking via AsyncLocalStorage
Multi-device sessions are tracked using Node.js `AsyncLocalStorage`:
- **Context Injection**: Middleware extracts `X-Device-Id` and `User-Agent` from incoming requests and stores them in `requestDeviceContext`.
- **Session Records**: The database `Session` table stores IP address, user-agent, device ID, and last active timestamp.
- **Compromise Mitigation**: Users can audit active devices and revoke unauthorized sessions in one click.

## 4. Frontend Single In-Flight Refresh Deduplication
To prevent "401 refresh storms" when multiple concurrent API requests encounter expired access tokens:
- Use a single singleton promise (`refreshPromise`) in `@/core/network/api-client.ts`.
- All parallel 401s await the identical refresh promise.
- The new token is broadcast to all waiting requests, eliminating race conditions.
