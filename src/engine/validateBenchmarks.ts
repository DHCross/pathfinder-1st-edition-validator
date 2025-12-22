import type { PF1eStatBlock, ValidationResult, ValidationMessage } from '../types/PF1eStatBlock';
import { MonsterStatisticsByCR, CreatureTypeRules, SizeConstants } from '../rules/pf1e-data-tables';

/**
 * Validates a creature's stats against Bestiary 1 benchmarks.
 * Checks if the creature is appropriately balanced for its CR.
 * - HP: Detects "Glass Jaw" (<70%) or "Damage Sponge" (>150%)
 * - AC: Detects underarmored or overarmored creatures
 * - Saves: Flags critically weak saves
 */
export function validateBenchmarks(block: PF1eStatBlock | any): ValidationResult {
  const messages: ValidationMessage[] = [];

  // Get CR as number for lookup (needed for exception detection)
  const crValue = typeof block.cr === 'number' ? block.cr : parseInt(String(block.cr), 10);
  
  // --- ENCOUNTER EXCEPTION CHECK ---
  // If a creature is flagged as "not meant to be fought", skip benchmark validation.
  // This is for world-building NPCs/monsters that exist for realism, not combat balance.
  if (block.encounterException === true) {
    const typeLabel = block.encounterExceptionType ? `[${block.encounterExceptionType.toUpperCase()}]` : '';
    const reason = block.encounterExceptionReason || 'Flagged as non-combat encounter (world-building / scenery creature)';
    messages.push({
      severity: 'note',
      category: 'benchmarks',
      message: `⚠️ ENCOUNTER EXCEPTION ${typeLabel}: ${block.name || 'Creature'} (CR ${block.cr}) — ${reason}. Benchmark validation skipped.`,
    });
    return { valid: true, messages, status: 'PASS' } as any;
  }

  // --- AUTO-DETECT LEVEL MISMATCH (suggest exceptions) ---
  // If partyLevel or adventureLevelRange is set, detect significant CR mismatches.
  const partyLevel = block.partyLevel ?? block.adventureLevelRange?.min;
  if (partyLevel !== undefined && !isNaN(crValue)) {
    const crDelta = crValue - partyLevel;
    
    // OVERPOWERED: CR is 5+ above party level (e.g., CR 15 dragon in level 3 adventure)
    if (crDelta >= 5) {
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `🐉 POSSIBLE EXCEPTION (OVERPOWERED): ${block.name || 'Creature'} is CR ${block.cr} but party level is ${partyLevel}. If this is a "flee or die" / scenery creature, consider setting encounterException: true with encounterExceptionType: 'overpowered'.`,
        expected: `CR ~${partyLevel - 1} to ${partyLevel + 3}`,
        actual: crValue
      });
    }
    
    // TRIVIAL: CR is 4+ below party level (e.g., CR 1 guards in level 10 adventure)
    if (crDelta <= -4) {
      messages.push({
        severity: 'warning',
        category: 'benchmarks', 
        message: `🛡️ POSSIBLE EXCEPTION (TRIVIAL): ${block.name || 'Creature'} is CR ${block.cr} but party level is ${partyLevel}. If these are "realistic" world-building NPCs (guards, commoners), consider setting encounterException: true with encounterExceptionType: 'trivial'.`,
        expected: `CR ~${partyLevel - 3} to ${partyLevel + 3}`,
        actual: crValue
      });
    }
  }

  if (isNaN(crValue)) {
    return { valid: true, messages, status: 'PASS' } as any;
  }

  // Find the benchmark entry by CR
  const benchmarks = MonsterStatisticsByCR.find((row) => row.cr === String(block.cr) || row.cr === block.cr_text);

  if (!benchmarks) {
    // CR not in table; skip benchmarking
    return { valid: true, messages, status: 'PASS' } as any;
  }

  let hpStatus: 'high' | 'low' | 'ok' = 'ok';
  let acStatus: 'high' | 'low' | 'ok' = 'ok';

  const hpClaimed = block.hp_claimed ?? block.hp ?? undefined;
  // Deep HP verification using HD + CON mod
  const hdFromBlock = (block.racialHD || 0) + ((block.classLevels || []).reduce ? (block.classLevels || []).reduce((s: number, c: any) => s + (c.level || 0), 0) : 0);
  if (hpClaimed !== undefined && typeof hpClaimed === 'number') {
    // Determine hit die type from creature type if available
    const typeRule = CreatureTypeRules[block.type] || { hitDieType: 8 } as any;
    const hitDie = typeRule.hitDieType || 8;
    const avgDie = (hitDie / 2) + 0.5;
    const conMod = Math.floor(((block.con || 10) - 10) / 2);
    const expectedHPfromHD = hdFromBlock > 0 ? Math.floor(avgDie * hdFromBlock) + (conMod * hdFromBlock) : undefined;

    if (expectedHPfromHD !== undefined) {
      const deltaPerHD = Math.abs(hpClaimed - expectedHPfromHD) / Math.max(1, hdFromBlock);
      if (deltaPerHD > 2) {
        messages.push({
          severity: 'warning',
          category: 'benchmarks',
          message: `HP ${hpClaimed} deviates from expected HP ${expectedHPfromHD} by more than ±2 per HD (calculated using ${hdFromBlock} HD and d${hitDie}).`,
          expected: expectedHPfromHD,
          actual: hpClaimed
        });
        hpStatus = deltaPerHD > 4 ? 'low' : 'ok';
      }
    }

    // Fallback: compare to CR benchmark broadly
    const hpPercent = hpClaimed / benchmarks.hp;
    if (hpPercent < 0.7) hpStatus = 'low';
    else if (hpPercent > 1.5) hpStatus = 'high';
  }

  // 2. Validate AC (The "Unhittable" Check)
  const acClaimed = block.ac_claimed ?? block.ac ?? undefined;
  if (acClaimed !== undefined && typeof acClaimed === 'number') {
    const acDiff = acClaimed - benchmarks.ac;

    if (acDiff < -4) {
      acStatus = 'low';
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `AC ${acClaimed} is very low for CR ${block.cr}. Standard is ~${benchmarks.ac}. Creature will be crit often.`,
        expected: benchmarks.ac,
        actual: acClaimed
      });
    } else if (acDiff > 4) {
      acStatus = 'high';
      messages.push({
        severity: 'warning',
        category: 'benchmarks',
        message: `AC ${acClaimed} is very high for CR ${block.cr}. Standard is ~${benchmarks.ac}. Players may struggle to hit.`,
        expected: benchmarks.ac,
        actual: acClaimed
      });
    }
  }

  if (hpStatus === 'high' && acStatus === 'low') {
    messages.push({
      severity: 'warning',
      category: 'benchmarks',
      message: `HP ${hpClaimed} is far above benchmark while AC ${acClaimed} is far below it. This indicates 5e-style drift (damage sponge / low defense). Consider lowering HP or raising AC to stay within PF1e CR ${block.cr} expectations.`,
      expected: {
        hp: benchmarks.hp,
        ac: benchmarks.ac,
      },
      actual: {
        hp: hpClaimed,
        ac: acClaimed,
      },
    });
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

  // 4. BAB & CMB verification (recalculate using PF1e progressions)
  try {
    const totalHD = hdFromBlock || 0;
    let expectedBAB = 0;
    // Racial HD progression
    if (block.racialHD && block.racialHD > 0) {
      const prog = CreatureTypeRules[block.type]?.babProgression || 'medium';
      if (prog === 'fast') expectedBAB += block.racialHD;
      else if (prog === 'medium') expectedBAB += Math.floor(block.racialHD * 0.75);
      else expectedBAB += Math.floor(block.racialHD * 0.5);
    }
    // Class levels
    for (const cls of block.classLevels || []) {
      // class-level BAB progression lookup fallback uses medium if unknown
      const cProg = (CreatureTypeRules[(cls.className as any)] && CreatureTypeRules[(cls.className as any)].babProgression) || 'medium';
      if (cProg === 'fast') expectedBAB += cls.level || 0;
      else if (cProg === 'medium') expectedBAB += Math.floor((cls.level || 0) * 0.75);
      else expectedBAB += Math.floor((cls.level || 0) * 0.5);
    }

    if (block.bab_claimed !== undefined && block.bab_claimed !== expectedBAB) {
      messages.push({ severity: 'warning', category: 'benchmarks', message: `BAB claimed +${block.bab_claimed} differs from recalculated BAB +${expectedBAB} given type ${block.type} and ${totalHD} HD.`, expected: expectedBAB, actual: block.bab_claimed });
    }

    // CMB check
    const strMod = Math.floor(((block.str || 10) - 10) / 2);
    const sizeMod = (SizeConstants[block.size as string] || { cmbCmdMod: 0 }).cmbCmdMod || 0;
    const expectedCMB = expectedBAB + strMod + sizeMod;
    if (block.cmb !== undefined && block.cmb !== expectedCMB) {
      messages.push({ severity: 'warning', category: 'benchmarks', message: `CMB ${block.cmb} differs from expected ${expectedCMB} (BAB ${expectedBAB} + Str ${strMod} + Size ${sizeMod}).`, expected: expectedCMB, actual: block.cmb });
    }
  } catch (e) {
    // ignore
  }

  // --- NEW: CR/SIZE ALIGNMENT CHECK ---
  // Ensure minimum CR matches creature size (e.g., Large CR ≥ 2, Huge CR ≥ 4, etc.)
  const sizeMinCRTable: Record<string, number> = {
    'Tiny': 0, 'Small': 0, 'Medium': 0, 'Large': 2, 'Huge': 4, 'Gargantuan': 6, 'Colossal': 8
  };
  const minCRforSize = sizeMinCRTable[block.size as string];
  if (minCRforSize !== undefined && crValue < minCRforSize) {
    messages.push({
      severity: 'warning',
      category: 'benchmarks',
      message: `CR ${block.cr} is below minimum for ${block.size} size. ${block.size} creatures typically have CR ≥ ${minCRforSize}.`,
      expected: minCRforSize,
      actual: crValue
    });
  }

  const hasError = messages.some((m) => m.severity === 'critical');

  return {
    valid: !hasError,
    messages,
    status: messages.length > 0 ? 'WARN' : 'PASS',
  } as any;
}

export default validateBenchmarks;
