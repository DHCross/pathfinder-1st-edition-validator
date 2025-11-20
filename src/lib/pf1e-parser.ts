
import { PF1eStatBlock, ClassLevel } from '../types/PF1eStatBlock';
import { CreatureSize, CreatureType, ChallengeRatingValue, PfClassName } from '../rules/pf1e-data-tables';

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parsePF1eStatBlock(rawText: string): PF1eStatBlock {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = cleanText(rawText);

  const block: Partial<PF1eStatBlock> = {
    name: cleanText(lines[0] || 'Unnamed Creature'),
    classLevels: [],
    feats: [],
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    hp: 10, ac: 10, fort: 0, ref: 0, will: 0, bab: 0,
    cr: '1' as ChallengeRatingValue,
    size: 'Medium' as CreatureSize,
    type: 'Humanoid' as CreatureType, // Default
  };

  // --- REGEX PATTERNS ---
  const crMatch = fullText.match(/(?:CR|Challenge Rating)\s*(\d+(?:[\/\.]\d+)?)/i);
  if (crMatch) block.cr = crMatch[1] as ChallengeRatingValue;

  const xpMatch = fullText.match(/XP\s*([0-9,]+)/i);
  if (xpMatch) block.xp = parseInt(xpMatch[1].replace(/,/g, ''));

  // Improved Type/Class detection
  const typeMatch = fullText.match(/(LG|NG|CG|LN|N|CN|LE|NE|CE)\s+(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s+([a-zA-Z\-\s\(\)]+)/i);
  if (typeMatch) {
    block.alignment = typeMatch[1];
    block.size = typeMatch[2] as CreatureSize;
    
    // Normalize Type (Handle 'Fiend' -> 'Outsider')
    let rawType = typeMatch[3].trim();
    if (/Fiend|Devil|Demon|Daemon|Angel|Archon|Azata/i.test(rawType)) {
        block.type = 'Outsider';
    } else if (/Dragon/i.test(rawType)) {
        block.type = 'Dragon';
    } else if (/Undead/i.test(rawType)) {
        block.type = 'Undead';
    } else {
        // Fallback: take the first word as type
        block.type = rawType.split(' ')[0] as CreatureType;
    }
  }

  // Detect Class Levels (e.g. "Sorcerer 10")
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
  
  const ffMatch = fullText.match(/flat-footed\s*(\d+)/i);
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
  
  // Deduplication: If Racial HD == Sum of Class Levels, assume 0 Racial HD (it's an NPC)
  const totalClassLevels = block.classLevels?.reduce((sum, c) => sum + c.level, 0) || 0;
  if (block.racialHD === totalClassLevels && totalClassLevels > 0) {
      block.racialHD = 0;
  }

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

  const featsMatch = fullText.match(/Feats[:\s]+(.+?)(?:;|$|Skills|Languages|SQ|Ecology|Special Abilities)/i);
  if (featsMatch) {
    block.feats = featsMatch[1].split(/[,;]+/).map(f => f.trim()).filter(Boolean);
  }

  const treasureMatch = fullText.match(/Treasure\s+(.+?)(?:$|\n)/i);
  if (treasureMatch) {
      const tText = treasureMatch[1].toLowerCase();
      if (tText.includes('npc gear')) block.treasureType = 'NPC Gear';
      else if (tText.includes('standard')) block.treasureType = 'Standard';
      else block.treasureType = 'Standard';
  }

  return block as PF1eStatBlock;
}
