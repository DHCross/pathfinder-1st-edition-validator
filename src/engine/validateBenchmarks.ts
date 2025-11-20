import type { PF1eStatBlock, ValidationResult, ValidationMessage } from '../types/PF1eStatBlock';
import { MonsterStatisticsByCR } from '../rules/pf1e-data-tables';

/**
 * Validates a creature's stats against Bestiary 1 benchmarks.
 * Checks if the creature is appropriately balanced for its CR.
 * - HP: Detects "Glass Jaw" (<70%) or "Damage Sponge" (>150%)
 * - AC: Detects underarmored or overarmored creatures
 * - Saves: Flags critically weak saves
 */
export function validateBenchmarks(block: PF1eStatBlock | any): ValidationResult {
  const messages: ValidationMessage[] = [];

  // Get CR as number for lookup
  const crValue = typeof block.cr === 'number' ? block.cr : parseInt(String(block.cr), 10);
  if (isNaN(crValue)) {
    return { valid: true, messages, status: 'PASS' } as any;
  }

  // Find the benchmark entry by CR
  const benchmarks = MonsterStatisticsByCR.find((row) => row.cr === String(block.cr) || row.cr === block.cr_text);

  if (!benchmarks) {
    // CR not in table; skip benchmarking
    return { valid: true, messages, status: 'PASS' } as any;
  }

  // 1. Validate HP (The "Glass Jaw" Check)
  const hpClaimed = block.hp_claimed ?? block.hp ?? undefined;
  if (hpClaimed !== undefined && typeof hpClaimed === 'number') {
    const hpPercent = hpClaimed / benchmarks.hp;

    if (hpPercent < 0.7) {
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `HP ${hpClaimed} is very low for CR ${block.cr}. Standard is ~${benchmarks.hp}. Creature may be too fragile.`,
        expected: benchmarks.hp,
        actual: hpClaimed
      });
    } else if (hpPercent > 1.5) {
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `HP ${hpClaimed} is very high for CR ${block.cr}. Standard is ~${benchmarks.hp}. This is a "Damage Sponge."`,
        expected: benchmarks.hp,
        actual: hpClaimed
      });
    }
  }

  // 2. Validate AC (The "Unhittable" Check)
  const acClaimed = block.ac_claimed ?? block.ac ?? undefined;
  if (acClaimed !== undefined && typeof acClaimed === 'number') {
    const acDiff = acClaimed - benchmarks.ac;

    if (acDiff < -4) {
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `AC ${acClaimed} is very low for CR ${block.cr}. Standard is ~${benchmarks.ac}. Creature will be crit often.`,
        expected: benchmarks.ac,
        actual: acClaimed
      });
    } else if (acDiff > 4) {
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `AC ${acClaimed} is very high for CR ${block.cr}. Standard is ~${benchmarks.ac}. Players may struggle to hit.`,
        expected: benchmarks.ac,
        actual: acClaimed
      });
    }
  }

  // 3. Validate Saves
  const savesToCheck = [
    { name: 'Fort', val: block.fort_save_claimed },
    { name: 'Ref', val: block.ref_save_claimed },
    { name: 'Will', val: block.will_save_claimed },
  ];

  for (const s of savesToCheck) {
    if (s.val !== undefined && typeof s.val === 'number') {
      // If a save is lower than "Poor Save - 2", it is a critical weakness
      if (s.val < benchmarks.poorSave - 2) {
        messages.push({
          severity: 'warning',
          category: 'benchmarks',
          message: `${s.name} Save +${s.val} is very low for CR ${block.cr}. Standard is ~+${benchmarks.poorSave}. It will fail often.`,
          expected: benchmarks.poorSave,
          actual: s.val
        });
      }
    }
  }

  const hasError = messages.some((m) => m.severity === 'critical');

  return {
    valid: !hasError,
    messages,
    status: messages.length > 0 ? 'WARN' : 'PASS',
  } as any;
}

export default validateBenchmarks;
