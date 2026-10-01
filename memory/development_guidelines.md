# Development Guidelines & Engineering Governance

## Overview
This document establishes the non-negotiable engineering governance, architectural contracts, and operational protocols for the **Fanaye Technologies Boilerplate Evolution Project**. All contributors and AI agents must strictly abide by these directives.

---

## 1. Non-Negotiable Rules of Engagement

### Rule A: Anti-Hallucination & Reality-First Engineering
- Never assume an API, library, or framework capability exists without verifying exact versions, deprecation notices, and platform constraints.
- Never invent non-existent methods or claim a background process is simple when platform throttling applies.
- Always verify code compiles, dependencies resolve, and artifacts exist before claiming completion.

### Rule B: Strict Drift Control
- Every feature, class, service, or module must tie directly to the core project mission documented in [`memory/master_architecture.md`](file:///c:/Users/diguw/Desktop/fanaye-tech-boiler-plate/memory/master_architecture.md).
- Zero tolerance for bloat, redundant dependencies, or speculative out-of-scope abstractions.
- Every architectural component must solve a concrete, recurring requirement across company projects.

### Rule C: 3-Step Anti-Debug Loop Protocol
If a technical roadblock occurs (a build fails, an API crashes, a test errors out), **NEVER repeat the exact same failed action in a loop**.
You must apply the 3-step breakout rule:
1. **Identify Root Cause**: Extract exact error codes, stack traces, and environment context.
2. **Hypothesize & Formulate Alternative**: Formulate an alternative architectural approach or fallback layer.
3. **Document in Progress Log**: Record the issue and the architectural pivot in [`memory/progress_log.md`](file:///c:/Users/diguw/Desktop/fanaye-tech-boiler-plate/memory/progress_log.md).

### Rule D: Radical Honesty & Platform Boundary Disclosure
- If an OS, hardware, framework, or cloud limitation prevents a feature from working 100% natively, state it plainly. Never claim a software trick solves a physical or runtime-level constraint.
- Always design layered fallbacks (Tier 1 → Tier 2 → Tier 3) for fragile integrations or environment-dependent features.

### Rule E: Mandatory Memory Edit Logging
- **Every single time you create, modify, or refactor ANY file in `memory/`, you MUST immediately append an entry to `memory/edit_log.md`**.
- Entries must strictly adhere to the following commit format:
```markdown
### [COMMIT-XXXX] YYYY-MM-DD HH:MM:SS
- **Author**: Assistant & Lead Architect
- **Type**: [INIT | FEAT | REFACTOR | DOCS | FIX | RULE]
- **Target File(s)**: `memory/target_file.md`
- **Summary**: Concise title of the change
- **Diff / Details**:
  - Exact summary of what changed and why
```

### Rule F: Human-Centric Git Commit Messages & Branch Governance
- **Strictly No Robot/Conventional Prefixes**: Never use conventional commit prefixes such as `feat:`, `chore:`, `fix:`, `docs:`, `refactor:`, or `agent:`.
- **Natural Language Style**: All Git commit messages must be concise, human-written phrases explaining what the change accomplishes (e.g., *"Set up initial memory governance architecture"* or *"Add deep analysis of baseline nextjs boilerplate"*).
- **Active Working Branch**: All work and progress must be committed on branch `fanaye-technologies-boiler-plate`.


---

## 2. Multi-Repo Analysis & Component Harvester Protocol

In accordance with CTO directives:
1. **No Premature Refinement**: Do not start writing or mutating final boilerplate code until all candidate repositories and global references have undergone deep analysis.
2. **Dedicated Analysis Directories**: For every repository analyzed, create:
   ```
   analysis/<repo_name>/
   ├── <repo_name>_analysis.md    # Detailed codebase breakdown, patterns, dependencies
   ├── arch_analysis.md           # Architecture diagrams, design patterns, strengths & anti-patterns
   └── extracted_components/      # High-value, modular components copied for future integration
   ```
3. **Synthesis Phase**: Only after all repository analyses are indexed will the components be curated, normalized, and integrated into the definitive Fanaye Technologies Boilerplate.

---

## 3. Turn-by-Turn Operational Workflow

On **EVERY** interaction:
1. **Context Check**: Cross-reference the current user request against [`memory/master_architecture.md`](file:///c:/Users/diguw/Desktop/fanaye-tech-boiler-plate/memory/master_architecture.md) and [`memory/progress_log.md`](file:///c:/Users/diguw/Desktop/fanaye-tech-boiler-plate/memory/progress_log.md).
2. **Execute with Verification**: Make changes deliberately. Test and inspect actual outputs rather than assuming success.
3. **Log Progress & Decisions**: If a key architectural choice is made, record it as a numbered entry in the Technical Decisions Log inside [`memory/progress_log.md`](file:///c:/Users/diguw/Desktop/fanaye-tech-boiler-plate/memory/progress_log.md).
4. **Log Memory Edits**: Append a `[COMMIT-XXXX]` record to [`memory/edit_log.md`](file:///c:/Users/diguw/Desktop/fanaye-tech-boiler-plate/memory/edit_log.md) for any changes made inside `memory/`.
