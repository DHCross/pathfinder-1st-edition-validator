# Pathfinder 1st Edition Rules Validator

A TypeScript-based rules validation engine for Pathfinder 1st Edition stat blocks, built using Component-Driven Development (Storybook).

## Project Overview

This project implements a comprehensive validation system for PF1e creatures and NPCs, ensuring stat blocks comply with official Pathfinder 1st Edition rules.

### Architecture

The project follows a **3-Tier Architecture**:

- **Tier 1: Data Tables** (`src/rules/pf1e-data-tables.ts`)
  - Core game data: creature types, class statistics, size modifiers
  - Economic tables: Wealth By Level, Treasure By CR
  - XP tables and progression tracks

- **Tier 2: Documentation** (`Rules/` directory)
  - Markdown specifications for validation logic
  - Reference guides for character wealth, NPCs, and treasure
  - Monster building rules and gear validation specs

- **Tier 3: Validation Engine** (`src/engine/`)
  - `validateEconomy.ts`: Three Economic Tiers validation
  - Additional validators (to be implemented)

## Features

### ✅ Implemented

- **Economic Validation** - Three-tier system:
  - **Heroic NPCs**: PC classes using Wealth By Level (heroic track)
  - **Basic NPCs**: NPC classes using Wealth By Level (basic track)
  - **Monsters**: Racial HD using Treasure By CR tables
  
- **Data Tables**:
  - Complete creature type rules (HD, BAB, saves, skills)
  - Class statistics for all core and NPC classes
  - Size modifiers for combat calculations
  - Wealth By Level tables (heroic and basic)
  - Treasure By CR tables (slow/medium/fast tracks)

### 🚧 Planned

- Basic stat validation (HD, BAB, saves)
- Skill point validation
- Feat validation
- Attack bonus calculations
- AC and CMD validation
- Storybook component library

## Project Structure

```
Pathfinder 1st Edition Validator/
├── src/
│   ├── types/
│   │   └── PF1eStatBlock.ts      # Core TypeScript interfaces
│   ├── rules/
│   │   └── pf1e-data-tables.ts   # Game data tables
│   └── engine/
│       └── validateEconomy.ts    # Economy validation logic
├── Rules/
│   ├── Character Wealth Validator Guide.md
│   ├── NPCS and Treasure.md
│   ├── Treasure and XP Validation.md
│   ├── gear validation.md
│   ├── monster build rules.md
│   └── Monsters build part 2.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- TypeScript 5+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm test
```

## Usage Example

```typescript
import { validateEconomy } from './src/engine/validateEconomy';
import type { PF1eStatBlock } from './src/types/PF1eStatBlock';

const creature: PF1eStatBlock = {
  name: 'Adult Red Dragon',
  cr: '10',
  size: 'Huge',
  type: 'Dragon',
  racialHD: 12,
  gearValue: 5450, // Standard treasure for CR 10
  treasureType: 'Standard',
  // ... other stats
};

const result = validateEconomy(creature);
console.log(result.messages);
```

## Documentation

## Project Blueprint

The detailed architecture and feature set for a proposed Monster & NPC Builder app, named **Bestiary Architect**, is documented in `docs/Bestiary_Architect_Blueprint.md`. This document outlines the vision, modular architecture, and user workflows for a rules-grounded and creativity-focused builder.

See the `Rules/` directory for detailed specifications:

- **Character Wealth Validator Guide**: Core economic principles and WBL benchmarks
- **NPCs and Treasure**: Stat block structure and treasure generation rules
- **Treasure and XP Validation**: CR-to-XP-to-Treasure relationships
- **Gear Validation**: Three Economic Tiers and pricing algorithms

### How validation status works

This project uses a concise Traffic Light System to communicate validation results:
- 🔴 Critical (FAIL): structural or illegal rule violations
- 🟡 Warning (WARN): suspicious deviations from benchmarks
- ⚪ Note (PASS): informational only

For details on interpretation and developer guidance, see `docs/TRAFFIC_LIGHT_SYSTEM.md`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes.

## Contributing

This is a personal project, but suggestions and feedback are welcome via issues.

## License

MIT

## Acknowledgments

Based on the Pathfinder Roleplaying Game 1st Edition by Paizo Publishing.
