export type BabProgression = 'fast' | 'medium' | 'slow';
export type SaveName = 'Fort' | 'Ref' | 'Will';

export type CreatureType =
  | 'Aberration'
  | 'Animal'
  | 'Construct'
  | 'Dragon'
  | 'Fey'
  | 'Humanoid'
  | 'Magical Beast'
  | 'Monstrous Humanoid'
  | 'Ooze'
  | 'Outsider'
  | 'Plant'
  | 'Undead'
  | 'Vermin';

export interface CreatureTypeRule {
  babProgression: BabProgression;
  goodSaves: SaveName[];
  skillRanksPerHD: number;
  hitDieType: number;
  noSkillsOrFeats?: boolean;
}

export const CreatureTypeRules: Record<CreatureType, CreatureTypeRule> = {
  Aberration: {
    babProgression: 'medium',
    goodSaves: ['Will'],
    skillRanksPerHD: 4,
    hitDieType: 8,
  },
  Animal: {
    babProgression: 'medium',
    goodSaves: ['Fort', 'Ref'],
    skillRanksPerHD: 2,
    hitDieType: 8,
  },
  Construct: {
    babProgression: 'fast',
    goodSaves: [],
    skillRanksPerHD: 2,
    hitDieType: 10,
    noSkillsOrFeats: true,
  },
  Dragon: {
    babProgression: 'fast',
    goodSaves: ['Fort', 'Ref', 'Will'],
    skillRanksPerHD: 6,
    hitDieType: 12,
  },
  Fey: {
    babProgression: 'slow',
    goodSaves: ['Ref', 'Will'],
    skillRanksPerHD: 6,
    hitDieType: 6,
  },
  Humanoid: {
    babProgression: 'medium',
    goodSaves: ['Ref'],
    skillRanksPerHD: 2,
    hitDieType: 8,
  },
  'Magical Beast': {
    babProgression: 'fast',
    goodSaves: ['Fort', 'Ref'],
    skillRanksPerHD: 2,
    hitDieType: 10,
  },
  'Monstrous Humanoid': {
    babProgression: 'fast',
    goodSaves: ['Ref', 'Will'],
    skillRanksPerHD: 4,
    hitDieType: 10,
  },
  Ooze: {
    babProgression: 'medium',
    goodSaves: [],
    skillRanksPerHD: 2,
    hitDieType: 8,
    noSkillsOrFeats: true,
  },
  Outsider: {
    babProgression: 'fast',
    goodSaves: ['Ref', 'Will'],
    skillRanksPerHD: 6,
    hitDieType: 10,
  },
  Plant: {
    babProgression: 'medium',
    goodSaves: ['Fort'],
    skillRanksPerHD: 2,
    hitDieType: 8,
  },
  Undead: {
    babProgression: 'medium',
    goodSaves: ['Will'],
    skillRanksPerHD: 4,
    hitDieType: 8,
  },
  Vermin: {
    babProgression: 'medium',
    goodSaves: ['Fort'],
    skillRanksPerHD: 2,
    hitDieType: 8,
    noSkillsOrFeats: true,
  },
} as const;

export type PfClassName =
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Wizard'
  | 'Warrior'
  | 'Expert'
  | 'Commoner'
  | 'Adept'
  | 'Aristocrat';

export interface ClassStatisticsEntry {
  hitDieType: number;
  babProgression: BabProgression;
  goodSaves: SaveName[];
  skillRanksPerLevel: number;
  crMod: number;
}

export const ClassStatistics: Record<PfClassName, ClassStatisticsEntry> = {
  Barbarian: {
    hitDieType: 12,
    babProgression: 'fast',
    goodSaves: ['Fort'],
    skillRanksPerLevel: 4,
    crMod: -1,
  },
  Bard: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Ref', 'Will'],
    skillRanksPerLevel: 6,
    crMod: -1,
  },
  Cleric: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Fort', 'Will'],
    skillRanksPerLevel: 2,
    crMod: -1,
  },
  Druid: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Fort', 'Will'],
    skillRanksPerLevel: 4,
    crMod: -1,
  },
  Fighter: {
    hitDieType: 10,
    babProgression: 'fast',
    goodSaves: ['Fort'],
    skillRanksPerLevel: 2,
    crMod: -1,
  },
  Monk: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Fort', 'Ref', 'Will'],
    skillRanksPerLevel: 4,
    crMod: -1,
  },
  Paladin: {
    hitDieType: 10,
    babProgression: 'fast',
    goodSaves: ['Fort', 'Will'],
    skillRanksPerLevel: 2,
    crMod: -1,
  },
  Ranger: {
    hitDieType: 10,
    babProgression: 'fast',
    goodSaves: ['Fort', 'Ref'],
    skillRanksPerLevel: 6,
    crMod: -1,
  },
  Rogue: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Ref'],
    skillRanksPerLevel: 8,
    crMod: -1,
  },
  Sorcerer: {
    hitDieType: 6,
    babProgression: 'slow',
    goodSaves: ['Will'],
    skillRanksPerLevel: 2,
    crMod: -1,
  },
  Wizard: {
    hitDieType: 6,
    babProgression: 'slow',
    goodSaves: ['Will'],
    skillRanksPerLevel: 2,
    crMod: -1,
  },
  Warrior: {
    hitDieType: 10,
    babProgression: 'fast',
    goodSaves: ['Fort'],
    skillRanksPerLevel: 2,
    crMod: -2,
  },
  Expert: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Ref', 'Will'],
    skillRanksPerLevel: 6,
    crMod: -2,
  },
  Commoner: {
    hitDieType: 6,
    babProgression: 'slow',
    goodSaves: [],
    skillRanksPerLevel: 2,
    crMod: -2,
  },
  Adept: {
    hitDieType: 6,
    babProgression: 'slow',
    goodSaves: ['Will'],
    skillRanksPerLevel: 2,
    crMod: -2,
  },
  Aristocrat: {
    hitDieType: 8,
    babProgression: 'medium',
    goodSaves: ['Will'],
    skillRanksPerLevel: 4,
    crMod: -2,
  },
} as const;

export type CreatureSize =
  | 'Fine'
  | 'Diminutive'
  | 'Tiny'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Huge'
  | 'Gargantuan'
  | 'Colossal';

export interface SizeConstantsEntry {
  acAttackMod: number;
  cmbCmdMod: number;
  stealthMod: number;
}

export const SizeConstants: Record<CreatureSize, SizeConstantsEntry> = {
  Fine: { acAttackMod: 8, cmbCmdMod: -8, stealthMod: 16 },
  Diminutive: { acAttackMod: 4, cmbCmdMod: -4, stealthMod: 12 },
  Tiny: { acAttackMod: 2, cmbCmdMod: -2, stealthMod: 8 },
  Small: { acAttackMod: 1, cmbCmdMod: -1, stealthMod: 4 },
  Medium: { acAttackMod: 0, cmbCmdMod: 0, stealthMod: 0 },
  Large: { acAttackMod: -1, cmbCmdMod: 1, stealthMod: -4 },
  Huge: { acAttackMod: -2, cmbCmdMod: 2, stealthMod: -8 },
  Gargantuan: { acAttackMod: -4, cmbCmdMod: 4, stealthMod: -12 },
  Colossal: { acAttackMod: -8, cmbCmdMod: 8, stealthMod: -16 },
} as const;

export interface ExperienceTracks {
  fast: number[];
  medium: number[];
  slow: number[];
}

export const ExperienceTable: ExperienceTracks = {
  fast: [
    0,
    1300,
    3300,
    6000,
    10000,
    15000,
    23000,
    34000,
    50000,
    71000,
    105000,
    145000,
    210000,
    295000,
    425000,
    600000,
    850000,
    1200000,
    1700000,
    2400000,
  ],
  medium: [
    0,
    2000,
    5000,
    9000,
    15000,
    23000,
    35000,
    51000,
    75000,
    105000,
    155000,
    220000,
    315000,
    445000,
    635000,
    890000,
    1300000,
    1800000,
    2550000,
    3600000,
  ],
  slow: [
    0,
    3000,
    7500,
    14000,
    23000,
    35000,
    53000,
    77000,
    115000,
    160000,
    235000,
    330000,
    475000,
    665000,
    955000,
    1350000,
    1900000,
    2700000,
    3850000,
    5350000,
  ],
};

export type CharacterLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export interface WealthByLevelTable {
  basicNpc: Partial<Record<CharacterLevel, number>>;
  heroicNpc: Partial<Record<CharacterLevel, number>>;
}

export const WealthByLevel: WealthByLevelTable = {
  basicNpc: {
    1: 260,
    2: 390,
    3: 780,
    4: 1650,
    5: 2400,
    6: 3450,
    7: 4650,
    8: 6000,
    9: 7800,
    10: 10050,
    11: 12750,
    12: 16350,
    13: 21000,
    14: 27000,
    15: 34800,
    16: 45000,
    17: 58500,
    18: 75000,
    19: 96000,
    20: 123000,
  },
  heroicNpc: {},
};

export const TreasureValuePerEncounterMedium: Record<number, number> = {
  1: 260,
  2: 550,
  3: 800,
  4: 1150,
  5: 1550,
  6: 2000,
  7: 2600,
  8: 3350,
  9: 4250,
  10: 5450,
  11: 7000,
  12: 9000,
  13: 11600,
  14: 15000,
  15: 19500,
  16: 25000,
  17: 32000,
  18: 41000,
  19: 53000,
  20: 67000,
};

const ENCOUNTERS_PER_LEVEL = 13;
const PARTY_SIZE = 4;

(function initWealthByLevelFromTreasure() {
  let cumulativeHeroic = 0;
  for (let level = 1 as CharacterLevel; level <= 20; level = (level + 1) as CharacterLevel) {
    const perEncounter = TreasureValuePerEncounterMedium[level];
    if (!perEncounter) continue;
    const perLevelPerPC = (perEncounter * ENCOUNTERS_PER_LEVEL) / PARTY_SIZE;
    cumulativeHeroic += perLevelPerPC;
    WealthByLevel.heroicNpc[level] = Math.round(cumulativeHeroic);
  }
})();

export type ChallengeRatingValue =
  | '1/8'
  | '1/6'
  | '1/4'
  | '1/3'
  | '1/2'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | '23'
  | '24'
  | '25';

export interface MonsterStatisticsRow {
  cr: ChallengeRatingValue;
  hp: number;
  ac: number;
  highAttackBonus: number;
  lowAttackBonus: number;
  averageDamagePerRound: number;
  primaryAbilityDC: number;
  secondaryAbilityDC: number;
  goodSave: number;
  poorSave: number;
}

export const MonsterStatisticsByCR: MonsterStatisticsRow[] = [
  {
    cr: '1/8',
    hp: 5,
    ac: 10,
    highAttackBonus: -1,
    lowAttackBonus: -2,
    averageDamagePerRound: 2,
    primaryAbilityDC: 9,
    secondaryAbilityDC: 6,
    goodSave: 1,
    poorSave: -2,
  },
  {
    cr: '1/6',
    hp: 7,
    ac: 10,
    highAttackBonus: 0,
    lowAttackBonus: -1,
    averageDamagePerRound: 3,
    primaryAbilityDC: 10,
    secondaryAbilityDC: 7,
    goodSave: 2,
    poorSave: -1,
  },
  {
    cr: '1/4',
    hp: 8,
    ac: 10,
    highAttackBonus: 0,
    lowAttackBonus: -1,
    averageDamagePerRound: 3,
    primaryAbilityDC: 10,
    secondaryAbilityDC: 7,
    goodSave: 2,
    poorSave: -1,
  },
  {
    cr: '1/3',
    hp: 9,
    ac: 10,
    highAttackBonus: 0,
    lowAttackBonus: -1,
    averageDamagePerRound: 3,
    primaryAbilityDC: 10,
    secondaryAbilityDC: 7,
    goodSave: 2,
    poorSave: -1,
  },
  {
    cr: '1/2',
    hp: 10,
    ac: 11,
    highAttackBonus: 1,
    lowAttackBonus: 0,
    averageDamagePerRound: 4,
    primaryAbilityDC: 11,
    secondaryAbilityDC: 8,
    goodSave: 3,
    poorSave: 0,
  },
  {
    cr: '1',
    hp: 15,
    ac: 12,
    highAttackBonus: 2,
    lowAttackBonus: 1,
    averageDamagePerRound: 7,
    primaryAbilityDC: 12,
    secondaryAbilityDC: 9,
    goodSave: 4,
    poorSave: 1,
  },
  {
    cr: '2',
    hp: 20,
    ac: 14,
    highAttackBonus: 4,
    lowAttackBonus: 3,
    averageDamagePerRound: 10,
    primaryAbilityDC: 13,
    secondaryAbilityDC: 9,
    goodSave: 5,
    poorSave: 1,
  },
  {
    cr: '3',
    hp: 30,
    ac: 15,
    highAttackBonus: 6,
    lowAttackBonus: 4,
    averageDamagePerRound: 13,
    primaryAbilityDC: 14,
    secondaryAbilityDC: 10,
    goodSave: 6,
    poorSave: 2,
  },
  {
    cr: '4',
    hp: 40,
    ac: 17,
    highAttackBonus: 8,
    lowAttackBonus: 6,
    averageDamagePerRound: 16,
    primaryAbilityDC: 15,
    secondaryAbilityDC: 10,
    goodSave: 7,
    poorSave: 3,
  },
  {
    cr: '5',
    hp: 55,
    ac: 18,
    highAttackBonus: 10,
    lowAttackBonus: 7,
    averageDamagePerRound: 20,
    primaryAbilityDC: 15,
    secondaryAbilityDC: 11,
    goodSave: 8,
    poorSave: 4,
  },
  {
    cr: '6',
    hp: 70,
    ac: 19,
    highAttackBonus: 12,
    lowAttackBonus: 8,
    averageDamagePerRound: 25,
    primaryAbilityDC: 16,
    secondaryAbilityDC: 11,
    goodSave: 9,
    poorSave: 5,
  },
  {
    cr: '7',
    hp: 85,
    ac: 20,
    highAttackBonus: 13,
    lowAttackBonus: 10,
    averageDamagePerRound: 30,
    primaryAbilityDC: 17,
    secondaryAbilityDC: 12,
    goodSave: 10,
    poorSave: 6,
  },
  {
    cr: '8',
    hp: 100,
    ac: 21,
    highAttackBonus: 15,
    lowAttackBonus: 11,
    averageDamagePerRound: 35,
    primaryAbilityDC: 18,
    secondaryAbilityDC: 12,
    goodSave: 11,
    poorSave: 7,
  },
  {
    cr: '9',
    hp: 115,
    ac: 23,
    highAttackBonus: 17,
    lowAttackBonus: 12,
    averageDamagePerRound: 40,
    primaryAbilityDC: 18,
    secondaryAbilityDC: 13,
    goodSave: 12,
    poorSave: 8,
  },
  {
    cr: '10',
    hp: 130,
    ac: 24,
    highAttackBonus: 18,
    lowAttackBonus: 13,
    averageDamagePerRound: 45,
    primaryAbilityDC: 19,
    secondaryAbilityDC: 13,
    goodSave: 13,
    poorSave: 9,
  },
  {
    cr: '11',
    hp: 145,
    ac: 25,
    highAttackBonus: 19,
    lowAttackBonus: 14,
    averageDamagePerRound: 50,
    primaryAbilityDC: 20,
    secondaryAbilityDC: 14,
    goodSave: 14,
    poorSave: 10,
  },
  {
    cr: '12',
    hp: 160,
    ac: 27,
    highAttackBonus: 21,
    lowAttackBonus: 15,
    averageDamagePerRound: 55,
    primaryAbilityDC: 21,
    secondaryAbilityDC: 15,
    goodSave: 15,
    poorSave: 11,
  },
  {
    cr: '13',
    hp: 180,
    ac: 28,
    highAttackBonus: 22,
    lowAttackBonus: 16,
    averageDamagePerRound: 60,
    primaryAbilityDC: 21,
    secondaryAbilityDC: 15,
    goodSave: 16,
    poorSave: 12,
  },
  {
    cr: '14',
    hp: 200,
    ac: 29,
    highAttackBonus: 23,
    lowAttackBonus: 17,
    averageDamagePerRound: 65,
    primaryAbilityDC: 22,
    secondaryAbilityDC: 16,
    goodSave: 17,
    poorSave: 12,
  },
  {
    cr: '15',
    hp: 220,
    ac: 30,
    highAttackBonus: 24,
    lowAttackBonus: 18,
    averageDamagePerRound: 70,
    primaryAbilityDC: 23,
    secondaryAbilityDC: 16,
    goodSave: 18,
    poorSave: 13,
  },
  {
    cr: '16',
    hp: 240,
    ac: 31,
    highAttackBonus: 26,
    lowAttackBonus: 19,
    averageDamagePerRound: 80,
    primaryAbilityDC: 24,
    secondaryAbilityDC: 17,
    goodSave: 19,
    poorSave: 14,
  },
  {
    cr: '17',
    hp: 270,
    ac: 32,
    highAttackBonus: 27,
    lowAttackBonus: 20,
    averageDamagePerRound: 90,
    primaryAbilityDC: 24,
    secondaryAbilityDC: 18,
    goodSave: 20,
    poorSave: 15,
  },
  {
    cr: '18',
    hp: 300,
    ac: 33,
    highAttackBonus: 28,
    lowAttackBonus: 21,
    averageDamagePerRound: 100,
    primaryAbilityDC: 25,
    secondaryAbilityDC: 18,
    goodSave: 20,
    poorSave: 16,
  },
  {
    cr: '19',
    hp: 330,
    ac: 34,
    highAttackBonus: 29,
    lowAttackBonus: 22,
    averageDamagePerRound: 110,
    primaryAbilityDC: 26,
    secondaryAbilityDC: 19,
    goodSave: 21,
    poorSave: 16,
  },
  {
    cr: '20',
    hp: 370,
    ac: 36,
    highAttackBonus: 30,
    lowAttackBonus: 23,
    averageDamagePerRound: 120,
    primaryAbilityDC: 27,
    secondaryAbilityDC: 20,
    goodSave: 22,
    poorSave: 17,
  },
  {
    cr: '21',
    hp: 410,
    ac: 37,
    highAttackBonus: 31,
    lowAttackBonus: 24,
    averageDamagePerRound: 130,
    primaryAbilityDC: 27,
    secondaryAbilityDC: 20,
    goodSave: 23,
    poorSave: 18,
  },
  {
    cr: '22',
    hp: 450,
    ac: 38,
    highAttackBonus: 32,
    lowAttackBonus: 25,
    averageDamagePerRound: 140,
    primaryAbilityDC: 28,
    secondaryAbilityDC: 21,
    goodSave: 24,
    poorSave: 18,
  },
  {
    cr: '23',
    hp: 500,
    ac: 39,
    highAttackBonus: 34,
    lowAttackBonus: 26,
    averageDamagePerRound: 150,
    primaryAbilityDC: 29,
    secondaryAbilityDC: 22,
    goodSave: 25,
    poorSave: 19,
  },
  {
    cr: '24',
    hp: 550,
    ac: 41,
    highAttackBonus: 35,
    lowAttackBonus: 27,
    averageDamagePerRound: 160,
    primaryAbilityDC: 29,
    secondaryAbilityDC: 22,
    goodSave: 26,
    poorSave: 20,
  },
  {
    cr: '25',
    hp: 600,
    ac: 42,
    highAttackBonus: 36,
    lowAttackBonus: 28,
    averageDamagePerRound: 170,
    primaryAbilityDC: 30,
    secondaryAbilityDC: 23,
    goodSave: 27,
    poorSave: 20,
  },
];

export type CRWithObservedXPVariant = '1/2' | '2' | '3' | '4' | '5' | '6';

export const CRToXPVariants: Partial<Record<CRWithObservedXPVariant, number[]>> = {
  '1/2': [75, 150],
  '2': [300, 600],
  '3': [450],
  '4': [600],
  '5': [1600],
  '6': [2400],
} as const;

// Treasure By CR (for Monster economic tier)
// Source: Bestiary / Core Rulebook Table 12-5
export interface TreasureByCREntry {
  slow: number;
  medium: number;
  fast: number;
}

export const TreasureByCR: Record<string, TreasureByCREntry> = {
  '1/8': { slow: 35, medium: 50, fast: 65 },
  '1/6': { slow: 45, medium: 65, fast: 80 },
  '1/4': { slow: 65, medium: 85, fast: 100 },
  '1/3': { slow: 90, medium: 135, fast: 170 },
  '1/2': { slow: 130, medium: 190, fast: 230 },
  '1': { slow: 170, medium: 260, fast: 400 },
  '2': { slow: 350, medium: 550, fast: 800 },
  '3': { slow: 550, medium: 800, fast: 1200 },
  '4': { slow: 750, medium: 1150, fast: 1700 },
  '5': { slow: 1000, medium: 1550, fast: 2300 },
  '6': { slow: 1350, medium: 2000, fast: 3000 },
  '7': { slow: 1750, medium: 2600, fast: 3900 },
  '8': { slow: 2200, medium: 3350, fast: 5000 },
  '9': { slow: 2850, medium: 4250, fast: 6400 },
  '10': { slow: 3650, medium: 5450, fast: 8200 },
  '11': { slow: 4650, medium: 7000, fast: 10500 },
  '12': { slow: 6000, medium: 9000, fast: 13500 },
  '13': { slow: 7750, medium: 11600, fast: 17500 },
  '14': { slow: 10000, medium: 15000, fast: 22000 },
  '15': { slow: 13000, medium: 19500, fast: 29000 },
  '16': { slow: 16500, medium: 25000, fast: 38000 },
  '17': { slow: 22000, medium: 32000, fast: 48000 },
  '18': { slow: 28000, medium: 41000, fast: 62000 },
  '19': { slow: 35000, medium: 53000, fast: 79000 },
  '20': { slow: 45000, medium: 67000, fast: 100000 },
  '21': { slow: 58000, medium: 88000, fast: 130000 },
  '22': { slow: 75000, medium: 110000, fast: 170000 },
  '23': { slow: 98000, medium: 150000, fast: 220000 },
  '24': { slow: 130000, medium: 200000, fast: 290000 },
  '25': { slow: 170000, medium: 260000, fast: 380000 },
};
