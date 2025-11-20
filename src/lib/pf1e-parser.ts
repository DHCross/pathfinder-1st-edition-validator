// src/lib/pf1e-parser.ts

import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { CreatureSize, CreatureType, ChallengeRatingValue, PfClassName } from '../rules/pf1e-data-tables';

/**
 * Cleans artifacts but preserves structural newlines for block parsing.
 */
function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '') // Markdown Bold
    .replace(/\*/g, '')   // Markdown Italic
    .replace(/__/g, '')   // Markdown Underline
    .replace(/_/g, '')    // Markdown Underline
    .replace(/[\u2018\u2019]/g, "'") // Smart Single Quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart Double Quotes
    .replace(/[\u2013\u2014]/g, '-') // En/Em Dashes
    .replace(/\u2212/g, '-')         // Minus Sign
    .replace(/\u00A0/g, ' ')         // Non-breaking Space
    .trim();
}

export function parsePF1eStatBlock(rawText: string): PF1eStatBlock {
  const fullText = cleanText(rawText);
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

  const block: Partial<PF1eStatBlock> = {
    name: lines[0] || 'Unnamed Creature',
    classLevels: [],
    feats: [],
    // Defaults
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    hp: 10, ac: 10, fort: 0, ref: 0, will: 0, bab: 0,
    cr: '1' as ChallengeRatingValue,
    size: 'Medium' as CreatureSize,
    type: 'Humanoid' as CreatureType,
  };

  // --- 1. SECTION EXTRACTION (Preserving the Soul) ---
  
  const meleeMatch = fullText.match(/Melee\s+(.+?)(?=\n|Ranged|Space|Special|Str|Statistic)/i);
  if (meleeMatch) block.melee_line = "Melee " + meleeMatch[1].trim();

  const rangedMatch = fullText.match(/Ranged\s+(.+?)(?=\n|Space|Special|Str|Statistic)/i);
  if (rangedMatch) block.ranged_line = "Ranged " + rangedMatch[1].trim();

  const speedMatch = fullText.match(/Speed\s+(.+?)(?=\n|Melee|Ranged|Space|Special|Str|Statistic)/i);
  if (speedMatch) block.speed_line = "Speed " + speedMatch[1].trim();

  const specialAttacksMatch = fullText.match(/Special Attacks\s+(.+?)(?=\n|Str|Statistic|Spells)/i);
  if (specialAttacksMatch) block.special_attacks_line = "Special Attacks " + specialAttacksMatch[1].trim();

  // Capture the entire Spell Block
  const spellsMatch = fullText.match(/(?:Spells|Spell-Like).+?(?=STATISTICS|Str\s+\d)/s);
  if (spellsMatch) block.spells_block = spellsMatch[0].trim();

  const abilitiesMatch = fullText.match(/SPECIAL ABILITIES(.+)$/s);
  if (abilitiesMatch) block.special_abilities_block = "SPECIAL ABILITIES\n" + abilitiesMatch[1].trim();

  const skillsMatch = fullText.match(/Skills\s+(.+?)(?=\n|Languages|SQ|Feats|Special|Gear|Treasure)/i);
  if (skillsMatch) block.skills_line = "Skills " + skillsMatch[1].trim();

  const langMatch = fullText.match(/Languages\s+(.+?)(?=\n|SQ|Feats|Special|Gear|Treasure)/i);
  if (langMatch) block.languages_line = "Languages " + langMatch[1].trim();

  const gearMatch = fullText.match(/(?:Combat Gear|Other Gear|Equipment)\s+(.+?)(?=\n|Special|Treasure)/is);
  if (gearMatch) block.equipment_line = "Equipment " + gearMatch[1].trim();


  // --- 2. CORE STAT PARSING (The Math) ---
  
  // CR & XP
  const crMatch = fullText.match(/(?:CR|Challenge Rating)\s*(\d+(?:[\/\.]\d+)?)/i);
  if (crMatch) block.cr = crMatch[1] as ChallengeRatingValue;
  
  const xpMatch = fullText.match(/XP\s*([0-9,]+)/i);
  if (xpMatch) block.xp = parseInt(xpMatch[1].replace(/,/g, ''));

  // Type & Class Detection
  const typeMatch = fullText.match(/(LG|NG|CG|LN|N|CN|LE|NE|CE)\s+(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s+([a-zA-Z\-\s\(\)]+)/i);
  if (typeMatch) {
    block.alignment = typeMatch[1];
    block.size = typeMatch[2] as CreatureSize;
    const rawType = typeMatch[3].trim();
    // Preserve the raw subtype token(s) so that the formatter can render the original type label
    block.subtypes = rawType.split(/,\s*/).map(s => s.trim()).filter(Boolean);
    
    // Map narrative types to mechanical types
    if (/Fiend|Devil|Demon|Daemon|Angel|Archon|Azata|Chaos-Beast/i.test(rawType)) block.type = 'Outsider';
    else if (/Dragon/i.test(rawType)) block.type = 'Dragon';
    else if (/Undead/i.test(rawType)) block.type = 'Undead';
    else if (/Beast/i.test(rawType)) block.type = 'Magical Beast';
    else block.type = rawType.split(' ')[0] as CreatureType;
  }

  // Detect Class Levels
  const classRegex = /(Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Wizard|Adept|Aristocrat|Commoner|Expert|Warrior)\s+(\d+)/gi;
  let clsMatch;
  while ((clsMatch = classRegex.exec(fullText)) !== null) {
      block.classLevels?.push({
          className: clsMatch[1] as PfClassName,
          level: parseInt(clsMatch[2])
      });
  }

  // Stats
  const acMatch = fullText.match(/AC\s*(\d+)/i);
  if (acMatch) block.ac_claimed = parseInt(acMatch[1]);
  const touchMatch = fullText.match(/touch\s*(\d+)/i);
  if (touchMatch) block.touch_ac_claimed = parseInt(touchMatch[1]);
  const ffMatch = fullText.match(/flat-?footed\s*(\d+)/i);
  if (ffMatch) block.flat_footed_ac_claimed = parseInt(ffMatch[1]);

  const hpMatch = fullText.match(/(?:hp|HP)\s*(\d+)\s*(?:\(([^)]+)\))?/);
  if (hpMatch) {
      block.hp_claimed = parseInt(hpMatch[1]);
      block.hp = parseInt(hpMatch[1]);
      if (hpMatch[2]) {
          const hdCount = /(\d+)d/.exec(hpMatch[2]);
          if (hdCount) block.racialHD = parseInt(hdCount[1]);
      }
  }
  
  // Logic Fix: If Racial HD == Class Levels, assume 0 Racial HD (Pure NPC)
  const totalLevels = block.classLevels?.reduce((s,c) => s + c.level, 0) || 0;
  if (block.racialHD === totalLevels && totalLevels > 0) block.racialHD = 0;

  const saveMatch = fullText.match(/Fort\s*\+?(-?\d+),\s*Ref\s*\+?(-?\d+),\s*Will\s*\+?(-?\d+)/i);
  if (saveMatch) {
      block.fort_save_claimed = parseInt(saveMatch[1]);
      block.ref_save_claimed = parseInt(saveMatch[2]);
      block.will_save_claimed = parseInt(saveMatch[3]);
  }

  const babMatch = fullText.match(/(?:Base Atk|Base Atk\.|Base Attack)\s*\+?(\d+)/i);
  if (babMatch) block.bab_claimed = parseInt(babMatch[1]);
  
  const cmdMatch = fullText.match(/CMD\s*(\d+)/i);
  if (cmdMatch) block.cmd_claimed = parseInt(cmdMatch[1]);

  // Attributes
  const strMatch = /Str\s*(\d+)/i.exec(fullText);
  const dexMatch = /Dex\s*(\d+)/i.exec(fullText);
  const conMatch = /Con\s*(\d+)/i.exec(fullText);
  const intMatch = /Int\s*(\d+)/i.exec(fullText);
  const wisMatch = /Wis\s*(\d+)/i.exec(fullText);
  const chaMatch = /Cha\s*(\d+)/i.exec(fullText);

  if (strMatch) block.str = parseInt(strMatch[1]);
  if (dexMatch) block.dex = parseInt(dexMatch[1]);
  if (conMatch) block.con = parseInt(conMatch[1]);
  if (intMatch) block.int = parseInt(intMatch[1]);
  if (wisMatch) block.wis = parseInt(wisMatch[1]);
  if (chaMatch) block.cha = parseInt(chaMatch[1]);

  if (block.ac_claimed) block.ac = block.ac_claimed;
  if (block.touch_ac_claimed) block.touch = block.touch_ac_claimed;
  if (block.flat_footed_ac_claimed) block.flatFooted = block.flat_footed_ac_claimed;

  // Senses
  const initMatch = fullText.match(/Init\s*([+-]?\d+)/i);
  if (initMatch) block.init_claimed = parseInt(initMatch[1]);
  const perceptionMatch = fullText.match(/Perception\s*([+-]?\d+)/i);
  if (perceptionMatch) block.perception_claimed = parseInt(perceptionMatch[1]);

  // Feats
  const featsMatch = fullText.match(/Feats[:\s]+(.+?)(?=\n|Skills|Languages|SQ|Ecology|Special Abilities)/i);
  if (featsMatch) block.feats = featsMatch[1].split(/[,;]/).map(f => f.trim()).filter(Boolean);

  const treasureMatch = fullText.match(/Treasure\s+(.+?)(?:$|\n)/i);
  if (treasureMatch) {
      const tText = treasureMatch[1].toLowerCase();
      if (tText.includes('npc gear')) block.treasureType = 'NPC Gear';
      else if (tText.includes('standard')) block.treasureType = 'Standard';
      else block.treasureType = 'Standard';
  }

  return block as PF1eStatBlock;
}
