import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { CreatureSize, CreatureType, ChallengeRatingValue } from '../rules/pf1e-data-tables';

/**
 * Cleans markdown artifacts and normalizes text for parsing
 */
function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove bold **
    .replace(/\*/g, '')   // Remove italics *
    .replace(/__/g, '')   // Remove underline __
    .replace(/\u2013|\u2014/g, '-') // Normalize en-dash/em-dash to hyphen
    .replace(/\u2212/g, '-') // Normalize minus sign
    .replace(/\n/g, ' ')  // Flatten newlines
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

export function parsePF1eStatBlock(rawText: string): PF1eStatBlock {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Clean the text BEFORE parsing
  const fullText = cleanText(rawText);

  const block: Partial<PF1eStatBlock> = {
    name: lines[0]?.replace(/\*/g, '') || 'Unnamed Creature', // Clean name too
    classLevels: [],
    feats: [],
    // Defaults
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    hp: 10, ac: 10, fort: 0, ref: 0, will: 0, bab: 0,
    cr: '1' as ChallengeRatingValue,
    size: 'Medium' as CreatureSize,
    type: 'humanoid' as CreatureType,
  };

  // --- REGEX PATTERNS ---
  const crRegex = /(?:CR|Challenge Rating)\s*(\d+(?:[\/\.]\d+)?)/i;
  const xpRegex = /XP\s*([0-9,]+)/i;
  // Type regex now handles "Chaos-Beast" and other hyphenated types better
  const typeRegex = /(LG|NG|CG|LN|N|CN|LE|NE|CE)\s+(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s+([a-zA-Z\-\s]+)/i;
  const acRegex = /AC\s*(\d+)/i;
  const touchAcRegex = /touch\s*(\d+)/i;
  const ffAcRegex = /flat-footed\s*(\d+)/i;
  const hpRegex = /(?:hp|HP)\s*(\d+)\s*(?:\(([^)]+)\))?/i;
  const saveRegex = /Fort\s*\+?(-?\d+),\s*Ref\s*\+?(-?\d+),\s*Will\s*\+?(-?\d+)/i;
  const babRegex = /(?:Base Atk|Base Atk\.|Base Attack)\s*\+?(\d+)/i;
  const cmdRegex = /CMD\s*(\d+)/i;
  // Feats: Stop at common section headers to prevent reading the whole bio
  const featsRegex = /Feats[:\s]+(.+?)(?:;|$|Skills|Languages|SQ|Ecology|Special Abilities)/i;
  const treasureRegex = /Treasure\s+(.+?)(?:$|\n|Special)/i;

  // --- PARSING ---

  // 1. CR & XP
  const crMatch = fullText.match(crRegex);
  if (crMatch) block.cr = crMatch[1] as ChallengeRatingValue;

  const xpMatch = fullText.match(xpRegex);
  if (xpMatch) block.xp = parseInt(xpMatch[1].replace(/,/g, ''));

  // 2. Size & Type
  const typeMatch = fullText.match(typeRegex);
  if (typeMatch) {
    block.alignment = typeMatch[1]; // Capture alignment
    block.size = typeMatch[2] as CreatureSize;
    block.type = typeMatch[3].trim() as CreatureType;
  }

  // 3. Defense
  const acMatch = fullText.match(acRegex);
  if (acMatch) block.ac_claimed = parseInt(acMatch[1]);
  
  const touchMatch = fullText.match(touchAcRegex);
  if (touchMatch) block.touch_ac_claimed = parseInt(touchMatch[1]);
  
  const ffMatch = fullText.match(ffAcRegex);
  if (ffMatch) block.flat_footed_ac_claimed = parseInt(ffMatch[1]);

  const hpMatch = fullText.match(hpRegex);
  if (hpMatch) {
      block.hp_claimed = parseInt(hpMatch[1]);
      block.hp = parseInt(hpMatch[1]);
      const hdPart = hpMatch[2];
      if (hdPart) {
          const racialHdMatch = /(\d+)d/.exec(hdPart);
          if (racialHdMatch) block.racialHD = parseInt(racialHdMatch[1]);
      }
  }

  const saveMatch = fullText.match(saveRegex);
  if (saveMatch) {
      block.fort_save_claimed = parseInt(saveMatch[1]);
      block.fort = parseInt(saveMatch[1]);
      block.ref_save_claimed = parseInt(saveMatch[2]);
      block.ref = parseInt(saveMatch[2]);
      block.will_save_claimed = parseInt(saveMatch[3]);
      block.will = parseInt(saveMatch[3]);
  }

  // 4. Offense
  const babMatch = fullText.match(babRegex);
  if (babMatch) {
    block.bab_claimed = parseInt(babMatch[1]);
    block.bab = parseInt(babMatch[1]);
  }
  const cmdMatch = fullText.match(cmdRegex);
  if (cmdMatch) {
    block.cmd_claimed = parseInt(cmdMatch[1]);
    block.cmd = parseInt(cmdMatch[1]);
  }

  // 5. Ability Scores
  // Now robust against "**Str**" because cleanText() removed the stars
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

  // Also copy claimed AC values to base AC fields
  if (block.ac_claimed) block.ac = block.ac_claimed;
  if (block.touch_ac_claimed) block.touch = block.touch_ac_claimed;
  if (block.flat_footed_ac_claimed) block.flatFooted = block.flat_footed_ac_claimed;

  // 6. Feats
  const featsMatch = fullText.match(featsRegex);
  if (featsMatch) {
    block.feats = featsMatch[1].split(/[,;]+/).map(f => f.trim()).filter(Boolean);
  }

  // 7. Treasure
  const treasureMatch = fullText.match(treasureRegex);
  if (treasureMatch) {
      const tText = treasureMatch[1].toLowerCase();
      if (tText.includes('npc gear')) block.treasureType = 'NPC Gear';
      else if (tText.includes('standard')) block.treasureType = 'Standard';
      else if (tText.includes('double')) block.treasureType = 'Double';
      else if (tText.includes('triple')) block.treasureType = 'Triple';
      else if (tText.includes('incidental')) block.treasureType = 'Incidental';
      else if (tText.includes('none')) block.treasureType = 'None';
  }

  return block as PF1eStatBlock;
}
