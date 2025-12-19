import { describe, it, expect } from 'vitest';
import { parsePF1eStatBlock } from '../../src/lib/pf1e-parser';
import { validateBasics } from '../../src/engine/validateBasics';
import { validateBenchmarks } from '../../src/engine/validateBenchmarks';

const TOAD = `Chaos-Mutated Toad CR 1
XP 400
CN Large Chaos-Beast
Init +1; Senses Darkvision 30ft; Perception +10
AC 11, touch 11, flat-footed 10 (+1 Dex, +1 Natural, -1 Size)
HP 15 (2d10 + 4)
Fort +4, Ref +6, Will +1
Melee Bite +4 (1d10 + 2 + Grapple Reflex DC 13)
Stats Str 15 Dex 13 Con 14 Int 2 Wis 10 Cha 3
Base Atk +1; CMB +4 CMD 14
Reaction: Quick Croak (see text)
`;

describe('System Bleed / Chaos-Mutated Toad regression', () => {
  it('detects Reflex DC grapple mechanic and 5e terminology and BAB math error', () => {
    const block = parsePF1eStatBlock(TOAD);

    const basics = validateBasics(block as any);
    const bench = validateBenchmarks(block as any);

    // 1. Reflex DC grapple mechanic (critical)
    const reflexMsg = basics.messages.concat(bench.messages).find(m => /reflex/i.test(m.message) || /Reflex DC/i.test(JSON.stringify(m)));
    expect(reflexMsg).toBeDefined();
    expect(reflexMsg?.severity).toBe('critical');

    // 2. Action/Reaction terminology (critical)
    const actionMsg = basics.messages.find(m => /reaction|bonus action|action/i.test(m.message));
    expect(actionMsg).toBeDefined();
    expect(actionMsg?.severity).toBe('critical');

    // 3. BAB math error warning
    const babMsg = basics.messages.find(m => /Base Attack Bonus|BAB claimed/i.test(m.message));
    expect(babMsg || bench.messages.find(m => /BAB claimed/i.test(m.message))).toBeDefined();
  });
});
