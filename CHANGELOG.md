# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), though versioning is currently lightweight and driven by milestones rather than strict semantic versioning.

## [Unreleased]

### Changed
- Triggered redeployment to GitHub Pages

### Planned
- Future validators for basics (HD, BAB, saves), skills, feats, AC/CMD, and Storybook integration.

## [0.1.0] - 2025-11-19

### Added

- **Initial project scaffolding**
  - Set up TypeScript project with `tsconfig.json` and `package.json`.
  - Added `.gitignore` and `README.md` with architecture overview and usage example.

- **Tier 1: PF1e rules data tables**
  - `src/rules/pf1e-data-tables.ts` with:
    - Creature type rules (HD, BAB progression, good saves, skills per HD).
    - Class statistics for core and NPC classes, including CR modifiers.
    - Size constants for AC/attack, CMB/CMD, and Stealth.
    - XP progressions (fast/medium/slow).
    - Wealth-by-Level tables for **heroic** and **basic** NPCs.
    - `TreasureByCR` table with slow/medium/fast GP values by CR.
    - Monster statistics by CR and CR-to-XP variants.

- **Tier 2: Rules documentation (Markdown specs)**
  - `Rules/Character Wealth Validator Guide.md` – WBL concepts and audit process.
  - `Rules/NPCS and Treasure.md` – stat block structure and NPC treasure rules.
  - `Rules/Treasure and XP Validation.md` – CR ↔ XP ↔ treasure relationships.
  - `Rules/gear validation.md` – Three Economic Tiers and gear pricing algorithms.
  - `Rules/monster build rules.md` and `Rules/Monsters build part 2.md` – monster construction guidance.

- **Tier 3: Validation engine (Economy)**
  - `src/types/PF1eStatBlock.ts` with `PF1eStatBlock`, economic tier, and validation result types.
  - `src/engine/validateEconomy.ts` implementing the **Three Economic Tiers** logic:
    - Heroic NPCs: Wealth-by-Level (heroic track) by effective level.
    - Basic NPCs: Wealth-by-Level (basic track) by effective level.
    - Monsters: `TreasureByCR` (medium track) by CR, modified by treasure type (None/Incidental/Standard/Double/Triple).
  - Over-/under-geared detection based on ±15% deviation from the expected benchmark.
