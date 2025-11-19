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

  // Economy & Gear
  economicTier?: EconomicTier;
  treasureType?: 'None' | 'Incidental' | 'Standard' | 'Double' | 'Triple' | 'NPC Gear';
  gearValue?: number; // Total market value of all gear in gp
  
  // Claim fields for validation results
  claimedLevel?: number;
  claimedEffectiveLevel?: number;
}

export interface ValidationMessage {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  expected?: any;
  actual?: any;
}

export interface ValidationResult {
  valid: boolean;
  messages: ValidationMessage[];
}
