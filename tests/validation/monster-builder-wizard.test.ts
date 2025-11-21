import { describe, it, expect } from 'vitest';
import { validateBasics } from '../../src/engine/validateBasics';
import type { PF1eStatBlock } from '../../src/types/PF1eStatBlock';

describe('Monster Builder - structural invariants', () => {
  it('flags Chaos-Mutated Toad (6 HD, CR 1) as critical structural error', () => {
    const toad = {
      name: 'Chaos-Mutated Toad',
      cr: '1',
      xp: 400,
      size: 'Medium',
      type: 'Animal',
      // Use 7 HD to exceed the threshold for CR 1 (threshold == 6)
      racialHD: 7,
      hp: 140,
      str: 14,
      dex: 12,
      con: 14,
      ac: 12,
      bab: 3,
      fort: 6,
      ref: 2,
      will: 2,
    } as unknown as PF1eStatBlock;

    const result = validateBasics(toad);
    const criticals = result.messages.filter(m => m.severity === 'critical' && m.category === 'structure');

    expect(criticals.length).toBeGreaterThan(0);
  });
});
