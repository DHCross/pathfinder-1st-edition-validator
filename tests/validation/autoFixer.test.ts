import { describe, it, expect } from 'vitest';
import { autoFixStatBlock } from '../../src/engine/autoFixer';
import type { PF1eStatBlock } from '../../src/types/PF1eStatBlock';

describe('autoFixer - derived stat calculations', () => {
  it('calculates saves and CMB correctly for a small animal', () => {
    const raw: PF1eStatBlock = {
      name: 'Animal Test',
      cr: '1',
      xp: 400,
      size: 'Medium',
      type: 'Animal',
      racialHD: 2,
      hp: 13,
      str: 14,
      dex: 12,
      con: 14,
      ac: 12,
      bab: 0,
      fort: 2,
      ref: 0,
      will: 0,
      int: 10,
      wis: 10,
      cha: 10
    } as PF1eStatBlock;

    const { block: fixed } = autoFixStatBlock(raw, 'enforce_cr');

    expect(fixed.fort).toBe(5); // 3 base + 2 con mod
    expect(fixed.ref).toBe(4);  // 3 base + 1 dex mod
    expect(fixed.will).toBe(0); // 0 base + 0 wis mod
    expect(fixed.cmb).toBe(3);  // BAB 1 + Str 2 + size 0
  });
});
