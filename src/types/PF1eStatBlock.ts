// src/types/PF1eStatBlock.ts

import type { ChallengeRatingValue, CreatureSize, CreatureType, PfClassName } from '../rules/pf1e-data-tables';

export type EconomicTier = 'Heroic NPC' | 'Basic NPC' | 'Monster';

export interface ClassLevel {
  className: PfClassName;
  level: number;
}

export interface PF1eStatBlock {
  // Header
  name: string;
  cr: ChallengeRatingValue;
  cr_text?: string; // Original text representation of CR if different from normalized value
  xp?: number;
  alignment?: string;
  size: CreatureSize;
  type: CreatureType;
  subtypes?: string[];

  // Racial HD
  racialHD?: number;

  // Class Levels
  classLevels?: ClassLevel[];

  // Defense
  hp: number;
  hd?: string; // e.g. "4d10+8"
  ac: number;
  touch?: number;
  flatFooted?: number;
  fort: number;
  ref: number;
  will: number;

  // Offense
  bab: number;
  cmb?: number;
  cmd?: number;

  // Statistics
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  // Feats
  feats?: string[];

  // Economy & Gear
  economicTier?: EconomicTier;
  treasureType?: 'None' | 'Incidental' | 'Standard' | 'Double' | 'Triple' | 'NPC Gear';
  gearValue?: number; // Total market value of all gear in gp

  // Encounter Context (for adventure-level validation)
  // Set these when validating creatures in context of an adventure or encounter series.
  partyLevel?: number; // Expected party level for this adventure/encounter
  adventureLevelRange?: { min: number; max: number }; // e.g., { min: 5, max: 8 } for a level 5-8 adventure

  // Encounter Exception Flags
  // Mark creatures that exist for world-building but are NOT meant to be fought.
  // Works BOTH ways:
  //   - High CR in low-level adventure: "Huge red dragon in town square" (flee or die)
  //   - Low CR in high-level adventure: "City guards" (realistic but trivial)
  encounterException?: boolean;
  encounterExceptionType?: 'overpowered' | 'trivial' | 'scenery' | 'plot-armor'; 
  // 'overpowered': CR way above party level (dragon in low-level town)
  // 'trivial': CR way below party level (guards in high-level adventure)  
  // 'scenery': Not meant to be interacted with combat-wise
  // 'plot-armor': NPC that cannot be killed for story reasons
  encounterExceptionReason?: string; // e.g., "Realistic city guards - not a real threat"
  
  // Claim fields for validation results
  claimedLevel?: number;
  claimedEffectiveLevel?: number;

  // NEW: Claimed stats for benchmarking
  ac_claimed?: number;
  touch_ac_claimed?: number;
  flat_footed_ac_claimed?: number;
  hp_claimed?: number;
  bab_claimed?: number;
  cmd_claimed?: number;
  fort_save_claimed?: number;
  ref_save_claimed?: number;
  will_save_claimed?: number;
  init_claimed?: number;
  perception_claimed?: number;

  // NEW: Preservation Fields (The "Soul" of the monster)
  melee_line?: string;
  ranged_line?: string;
  special_attacks_line?: string;
  spells_block?: string;
  skills_line?: string;
  languages_line?: string;
  equipment_line?: string;
  special_abilities_block?: string;
  speed_line?: string;
  // Parsed attack objects for deeper analysis
  meleeAttacks?: Array<{ name: string; toHit?: number; damage?: string; effect?: string }>;
}

// Traffic Light System
// ---------------------
// The validator produces messages classified by severity. These severities are
// designed as a "traffic light" for human readers:
//  - 'critical': 🔴 Illegal / Structural errors that must be fixed (maps to FAIL)
//  - 'warning' : 🟡 Suspicious deviations from benchmarks (maps to WARN)
//  - 'note'    : ⚪ Informational only (no effect on PASS/WARN/FAIL)
export type ValidationSeverity = 'critical' | 'warning' | 'note'; // The 3 Tiers

export interface ValidationMessage {
  severity: ValidationSeverity; // Updated type
  category: string;
  message: string;
  expected?: any;
  actual?: any;
}

export interface ValidationResult {
  valid: boolean; // True if 0 critical errors
  messages: ValidationMessage[];
  status?: 'PASS' | 'WARN' | 'FAIL';
}
