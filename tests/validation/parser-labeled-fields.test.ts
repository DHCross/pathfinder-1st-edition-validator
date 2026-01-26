import { describe, it, expect } from 'vitest';
import { parsePF1eStatBlock } from '../../src/lib/pf1e-parser';

describe('Parser - Labeled Fields', () => {
  it('parses labeled Type and Size fields correctly', () => {
    const lampreelText = `Lampreel
Aln: NE Size: H Type: Magical Beast Sub: Mutant
Init: +4 Senses: Darkvision 60 feet. Low-light vision. Perception: +10
DEFENSE
AC 14/18 touch 8/11 flat-footed 14/14 Dex, +0/+3 Natural, +6 /+6 Armor, +0 Size, -2/-1
HP 60 ( 6d10+20 ) (Body) Fast Healing 1
STATISTICS
Str 26 Dex 10 Con 18 Int 12 Wis 12 Cha 6
Base Atk +6 ; CMB +14 CMD 24`;

    const parsed = parsePF1eStatBlock(lampreelText);

    expect(parsed.type).toBe('Magical Beast');
    expect(parsed.size).toBe('Huge');
    expect(parsed.alignment).toBe('NE');
    expect(parsed.subtypes).toContain('Mutant');
  });

  it('falls back to default when no labels are present', () => {
    const standardText = `Goblin Warrior
NE Small Humanoid (Goblinoid)
Init: +6 Senses: Darkvision 60 ft.; Perception -1
DEFENSE
AC 16 touch 13 flat-footed 14 (+3 armor, +2 Dex, +1 size)
HP 11 (2d8+2)
Fort +1, Ref +2, Will +0
OFFENSE
Speed 30 ft.
Melee short sword +1 (1d4/19-20)
Ranged shortbow +4 (1d4/x3)
STATISTICS
Str 11, Dex 15, Con 12, Int 10, Wis 9, Cha 6
Base Atk +1; CMB +0; CMD 12
Feats Weapon Finesse
Skills Ride +6, Stealth +10; Racial Modifiers +4 Ride, +4 Stealth
Languages Goblin`;

    const parsed = parsePF1eStatBlock(standardText);

    expect(parsed.type).toBe('Humanoid');
    expect(parsed.size).toBe('Small');
    expect(parsed.alignment).toBe('NE');
    expect(parsed.subtypes).toContain('Goblinoid');
  });
});
