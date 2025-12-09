import React, { useEffect, useMemo, useState } from 'react';
import { parsePF1eStatBlock } from '../lib/pf1e-parser';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { autoFixStatBlock, FixMode, FixLogEntry } from '../engine/autoFixer';
import { scaleCreature } from '../engine/creatureScaler';
import { XP_Table, CreatureTypeRules, SizeConstants, ClassStatistics } from '../rules/pf1e-data-tables';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { ValidatorDisplay } from './ValidatorDisplay';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';
import { getBenchmarksForCR, estimateHDFromBenchmarks } from '../lib/benchmarkUtils';
import './ValidatorPlayground.css';

const SAMPLE_TEXT = `New Creature
CR 1
XP 400
N Medium Humanoid
Init +0; Senses Perception +0
DEFENSE
AC 12, touch 11, flat-footed 12
hp 20 (2d8+4)
Fort +2, Ref +0, Will +0
OFFENSE
Speed 30 ft.
Melee unarmed +1 (1d4)
STATISTICS
Str 10, Dex 10, Con 14, Int 10, Wis 10, Cha 10
Base Atk +1; CMB +1; CMD 12
Feats Improved Initiative
Treasure Standard`;

const normalizeCrKey = (value: string | number | undefined | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  let key = typeof value === 'number' ? value.toString() : String(value).trim();
  if (key === '0.5') key = '1/2';
  if (key === '0.33' || key === '0.333') key = '1/3';
  if (key === '0.25') key = '1/4';
  if (key === '0.16' || key === '0.166' || key === '0.167') key = '1/6';
  if (key === '0.125') key = '1/8';
  return key;
};

const calculateTotalHD = (block?: PF1eStatBlock | null) => {
  if (!block) return 0;
  const racial = block.racialHD ?? 0;
  const classHD = (block.classLevels || []).reduce((sum, cls) => sum + (cls.level || 0), 0);
  return racial + classHD;
};

const abilityMod = (score?: number | null) => Math.floor(((score ?? 10) - 10) / 2);

const computeExpectedBab = (block?: PF1eStatBlock | null) => {
  if (!block) return 0;
  let expectedBAB = 0;
  const racial = block.racialHD ?? 0;
  if (racial > 0) {
    const typeRule = CreatureTypeRules[block.type];
    const progression = typeRule?.babProgression ?? 'medium';
    if (progression === 'fast') expectedBAB += racial;
    else if (progression === 'medium') expectedBAB += Math.floor(racial * 0.75);
    else expectedBAB += Math.floor(racial * 0.5);
  }
  for (const cls of block.classLevels || []) {
    const stats = ClassStatistics[cls.className];
    if (!stats) continue;
    if (stats.babProgression === 'fast') expectedBAB += cls.level;
    else if (stats.babProgression === 'medium') expectedBAB += Math.floor(cls.level * 0.75);
    else expectedBAB += Math.floor(cls.level * 0.5);
  }
  if (racial === 0 && (block.classLevels || []).length === 0) {
    expectedBAB = block.bab ?? 0;
  }
  return expectedBAB;
};

const computeLegalCmd = (block?: PF1eStatBlock | null) => {
  if (!block) return null;
  const expectedBAB = computeExpectedBab(block);
  const sizeMod = SizeConstants[block.size]?.cmbCmdMod ?? 0;
  return 10 + expectedBAB + abilityMod(block.str) + abilityMod(block.dex) + sizeMod;
};

const computeSaveTargets = (block?: PF1eStatBlock | null) => {
  if (!block) return null;
  const totalHD = Math.max(1, calculateTotalHD(block));
  const goodSaveVal = Math.floor(2 + totalHD / 2);
  const badSaveVal = Math.floor(totalHD / 3);
  const typeRule = CreatureTypeRules[block.type] || { goodSaves: [] };
  return {
    fort: (typeRule.goodSaves?.includes('Fort') ? goodSaveVal : badSaveVal) + abilityMod(block.con),
    ref: (typeRule.goodSaves?.includes('Ref') ? goodSaveVal : badSaveVal) + abilityMod(block.dex),
    will: (typeRule.goodSaves?.includes('Will') ? goodSaveVal : badSaveVal) + abilityMod(block.wis),
    totalHD,
  };
};

type BenchmarkStatus = 'ok' | 'high' | 'low';

const benchmarkPalette: Record<BenchmarkStatus, { bg: string; color: string; label: string }> = {
  ok: { bg: '#ecfdf5', color: '#047857', label: 'On target' },
  high: { bg: '#fef3c7', color: '#b45309', label: 'High / Sponge' },
  low: { bg: '#fee2e2', color: '#b91c1c', label: 'Low / Glass Jaw' },
};

const evaluateBenchmarkStatus = (actual?: number | null, expected?: number | null): BenchmarkStatus => {
  if (actual === undefined || actual === null || expected === undefined || expected === null || expected === 0) {
    return 'ok';
  }
  const pct = (actual - expected) / expected;
  if (pct > 0.2) return 'high';
  if (pct < -0.2) return 'low';
  return 'ok';
};

type ValidatorPlaygroundProps = {
  initialText?: string;
  initialFixMode?: FixMode;
};

export const ValidatorPlayground: React.FC<ValidatorPlaygroundProps> = ({
  initialText = SAMPLE_TEXT,
  initialFixMode = 'enforce_cr',
}) => {
  const [rawInput, setRawInput] = useState(initialText);
  const [parsedBlock, setParsedBlock] = useState<PF1eStatBlock | null>(null);
  const [targetCR, setTargetCR] = useState<number>(1);
  const [fixMode, setFixMode] = useState<FixMode>(initialFixMode);
  const [fixedBlock, setFixedBlock] = useState<PF1eStatBlock | null>(null);
  const [fixLogs, setFixLogs] = useState<FixLogEntry[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const displayBlock = fixMode === 'enforce_cr' ? fixedBlock : parsedBlock;

  useEffect(() => {
    if (!rawInput.trim()) {
      setParsedBlock(null);
      setFixedBlock(null);
      setValidationResult(null);
      setFixLogs([]);
      return;
    }

    try {
      const parsed = parsePF1eStatBlock(rawInput);
      setParsedBlock(parsed);
      const crNum = parseInt(parsed.cr as string, 10);
      setTargetCR(isNaN(crNum) ? 1 : crNum);
    } catch (e) {
      console.error(e);
    }
  }, [rawInput]);

  useEffect(() => {
    if (!parsedBlock) return;

    let workingBlock = JSON.parse(JSON.stringify(parsedBlock)) as PF1eStatBlock;
    const currentLogs: FixLogEntry[] = [];

    const parsedCRStr = parsedBlock.cr as string;
    const targetCRStr = targetCR.toString();

    if (parsedCRStr !== targetCRStr) {
      const targetXP = XP_Table[targetCRStr];
      if (targetXP) {
        const { block: scaled, changes } = scaleCreature(workingBlock, targetXP);
        workingBlock = scaled;
        changes.forEach((reason) =>
          currentLogs.push({
            feature: 'Creature Scaler',
            oldValue: parsedCRStr,
            newValue: targetCRStr,
            reason,
          }),
        );
      }
    }

    const { block: fixed, fixes } = autoFixStatBlock(workingBlock, fixMode);
    setFixedBlock(fixed);
    setFixLogs([...currentLogs, ...fixes]);

    const rawStructuralCheck = validateBasics(parsedBlock);
    const structuralErrors = rawStructuralCheck.messages.filter((m) => m.category === 'structure');
    const rawBenchmarkCheck = validateBenchmarks(parsedBlock);
    const benchmarkWarnings = rawBenchmarkCheck.messages.filter((m) => m.severity !== 'note');

    const auditedBlock = fixMode === 'enforce_cr' ? fixed : parsedBlock;

    let vBasics: ValidationResult = { valid: true, status: 'PASS', messages: [] };
    let vBench: ValidationResult = { valid: true, status: 'PASS', messages: [] };
    let vEcon: ValidationResult = { valid: true, status: 'PASS', messages: [] };

    if (auditedBlock) {
      vBasics = validateBasics(auditedBlock as PF1eStatBlock);
      vBench = validateBenchmarks(auditedBlock as PF1eStatBlock);
      vEcon = validateEconomy(auditedBlock as PF1eStatBlock);
    }

    const allMessages = [
      ...structuralErrors,
      ...benchmarkWarnings,
      ...(vBasics.messages || []),
      ...(vBench.messages || []),
      ...(vEcon.messages || []),
    ];
    const hasStructuralFail = structuralErrors.some((m) => m.severity === 'critical');
    const hasOtherFail = vBasics.status === 'FAIL' || vEcon.status === 'FAIL';

    setValidationResult({
      valid: !hasStructuralFail && !hasOtherFail,
      status:
        hasStructuralFail || hasOtherFail
          ? 'FAIL'
          : vBasics.status === 'WARN' || vBench.status === 'WARN' || vEcon.status === 'WARN'
            ? 'WARN'
            : 'PASS',
      messages: allMessages,
    });
  }, [parsedBlock, targetCR, fixMode]);

  const guardrailData = useMemo(() => {
    if (!parsedBlock) return null;
    const crInput = parsedBlock.cr_text ?? parsedBlock.cr ?? targetCR;
    const normalizedKey = normalizeCrKey(crInput) ?? normalizeCrKey(targetCR);
    const benchmarks = getBenchmarksForCR(crInput);
    const hdEstimate = estimateHDFromBenchmarks(crInput);
    const totalHD = calculateTotalHD(parsedBlock);
    return {
      crLabel: parsedBlock.cr,
      totalHD,
      hdEstimate,
      hdMax: hdEstimate ? hdEstimate * 2 : null,
      canonicalXP: normalizedKey ? XP_Table[normalizedKey] : undefined,
      hpBenchmark: benchmarks?.hp,
      hpActual: parsedBlock.hp_claimed ?? parsedBlock.hp,
    };
  }, [parsedBlock, targetCR]);

  const benchmarkStats = useMemo(() => {
    if (!displayBlock) return [];
    const crInput = displayBlock.cr_text ?? displayBlock.cr ?? targetCR;
    const benchmarks = getBenchmarksForCR(crInput);
    if (!benchmarks) return [];
    const legalCmd = computeLegalCmd(displayBlock);
    return [
      {
        key: 'hp',
        label: 'HP Budget',
        actual: displayBlock.hp_claimed ?? displayBlock.hp,
        expected: benchmarks.hp,
        helper: 'Keep HP within ±20% of CR baseline.',
      },
      {
        key: 'ac',
        label: 'Armor Class',
        actual: displayBlock.ac_claimed ?? displayBlock.ac,
        expected: benchmarks.ac,
        helper: 'AC swings over 4 points skew encounter math.',
      },
      {
        key: 'cmd',
        label: 'CMD Health',
        actual: displayBlock.cmd_claimed ?? displayBlock.cmd ?? null,
        expected: legalCmd,
        helper: 'Legal CMD uses BAB + Str + Dex + size.',
      },
    ]
      .filter(
        (stat) =>
          stat.actual !== undefined && stat.actual !== null && stat.expected !== undefined && stat.expected !== null,
      )
      .map((stat) => ({
        ...stat,
        status: evaluateBenchmarkStatus(stat.actual as number, stat.expected as number),
      }));
  }, [displayBlock, targetCR]);

  const saveTargets = useMemo(() => computeSaveTargets(displayBlock), [displayBlock]);
  const legalCmd = useMemo(() => computeLegalCmd(displayBlock), [displayBlock]);
  const legalBab = useMemo(() => computeExpectedBab(displayBlock), [displayBlock]);

  const handleOverwriteWithAutoFix = () => {
    if (!fixedBlock) return;
    setRawInput(formatPF1eStatBlock(fixedBlock));
  };

  const handleRecalcChassis = () => {
    if (!parsedBlock) return;
    const recomputedBab = computeExpectedBab(parsedBlock);
    const saves = computeSaveTargets(parsedBlock);
    const cmd = computeLegalCmd(parsedBlock);
    const updatedBlock: PF1eStatBlock = {
      ...parsedBlock,
      bab: recomputedBab ?? parsedBlock.bab,
      bab_claimed: recomputedBab ?? parsedBlock.bab_claimed,
      fort: saves?.fort ?? parsedBlock.fort,
      ref: saves?.ref ?? parsedBlock.ref,
      will: saves?.will ?? parsedBlock.will,
      fort_save_claimed: saves?.fort ?? parsedBlock.fort_save_claimed,
      ref_save_claimed: saves?.ref ?? parsedBlock.ref_save_claimed,
      will_save_claimed: saves?.will ?? parsedBlock.will_save_claimed,
      cmd: cmd ?? parsedBlock.cmd,
      cmd_claimed: cmd ?? parsedBlock.cmd_claimed,
    };
    setRawInput(formatPF1eStatBlock(updatedBlock));
  };

  const renderSaveChip = (label: 'Fort' | 'Ref' | 'Will') => {
    if (!displayBlock || !saveTargets) return null;
    const actual = displayBlock[`${label.toLowerCase() as 'fort' | 'ref' | 'will'}`];
    const expected = saveTargets[label.toLowerCase() as 'fort' | 'ref' | 'will'];
    const status = evaluateBenchmarkStatus(actual, expected);
    const palette = benchmarkPalette[status];
    return (
      <div
        key={label}
        style={{
          borderRadius: 8,
          padding: '0.5rem 0.75rem',
          background: palette.bg,
          border: `1px solid ${palette.color}33`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: palette.color }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{typeof actual === 'number' ? `+${actual}` : '—'}</div>
        <div style={{ fontSize: 11, color: '#475569' }}>Legal: {expected !== undefined ? `+${expected}` : '—'}</div>
      </div>
    );
  };

  return (
    <div className="validator-playground">
      <div className="validator-column">
        <h2 className="validator-header">1. Raw Stat Block</h2>
        <textarea
          className="validator-textarea"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste stat block here..."
        />
      </div>

      <div className="validator-scroll-area">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 className="validator-header">2. Rules Lawyer Audit (v3.0)</h3>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Validating: {fixMode === 'enforce_cr' ? 'Auto-Fixed Version (Design Mode)' : 'Raw Input (Audit Mode)'}
          </div>

          {guardrailData && (
            <div
              style={{
                border: '1px solid #c7d2fe',
                background: '#eef2ff',
                borderRadius: 12,
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 700, color: '#312e81' }}>HD / CR Guardrail</div>
              <div style={{ fontSize: 13, color: '#312e81' }}>
                Declared CR {guardrailData.crLabel} expects roughly {guardrailData.hdEstimate ?? '—'} HD (
                {guardrailData.hpBenchmark ?? '—'} hp). This block lists {guardrailData.totalHD} HD.
              </div>
              {guardrailData.hdMax !== null && guardrailData.hdMax !== undefined && guardrailData.totalHD > guardrailData.hdMax && (
                <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>
                  Warning: Structural errors fire above {guardrailData.hdMax} HD for this CR.
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {guardrailData.canonicalXP && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#312e81',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    XP locked: {guardrailData.canonicalXP}
                  </span>
                )}
                {typeof guardrailData.hpActual === 'number' && (
                  <span style={{ fontSize: 12, color: '#475569' }}>Claimed HP: {guardrailData.hpActual}</span>
                )}
              </div>
            </div>
          )}

          {benchmarkStats.length > 0 && (
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {benchmarkStats.map((stat) => {
                const palette = benchmarkPalette[stat.status];
                return (
                  <div
                    key={stat.key}
                    style={{
                      borderRadius: 12,
                      padding: '0.75rem',
                      border: `1px solid ${palette.color}33`,
                      background: palette.bg,
                      boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: palette.color, textTransform: 'uppercase' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{stat.actual}</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Benchmark: {stat.expected ?? '—'}</div>
                    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: palette.color }}>{palette.label}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{stat.helper}</div>
                  </div>
                );
              })}
            </div>
          )}

          {displayBlock && (
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '0.75rem',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Chassis Snapshot</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: '#475569' }}>BAB</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    +{displayBlock.bab} <span style={{ fontSize: 12, color: '#94a3b8' }}>legal +{legalBab}</span>
                  </div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: '#475569' }}>CMD</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {displayBlock.cmd ?? '—'}
                    <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
                      legal {legalCmd ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
              {saveTargets && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['Fort', 'Ref', 'Will'].map((s) => renderSaveChip(s as any))}</div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRecalcChassis}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid #a5b4fc',
                    background: '#eef2ff',
                    color: '#4338ca',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Recalculate CMD & Saves
                </button>
                <button
                  type="button"
                  onClick={handleOverwriteWithAutoFix}
                  disabled={!fixedBlock}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid #22c55e',
                    background: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 600,
                    cursor: fixedBlock ? 'pointer' : 'not-allowed',
                    opacity: fixedBlock ? 1 : 0.6,
                  }}
                >
                  Overwrite Raw with Auto-Fix
                </button>
              </div>
            </div>
          )}

          {parsedBlock && validationResult && (
            <ValidatorDisplay
              statBlock={(fixMode === 'enforce_cr' ? fixedBlock : parsedBlock) as PF1eStatBlock}
              validation={validationResult}
              validationTarget={fixMode === 'enforce_cr' ? 'fixed' : 'raw'}
            />
          )}
        </div>

        {fixLogs.length > 0 && (
          <div className="fix-report">
            <h4 className="fix-report-header">🛠️ Auto-Fixes Applied ({fixMode === 'fix_math' ? 'Audit Mode' : 'Design Mode'})</h4>
            <ul className="fix-list">
              {fixLogs.map((fix, i) => (
                <li key={`${fix.feature}-${i}`} className="fix-item">
                  <div style={{ fontWeight: 600 }}>{fix.feature}</div>
                  <div className="fix-change-row">
                    <span className="fix-old">{String(fix.oldValue)}</span>
                    <span>→</span>
                    <span className="fix-new">{String(fix.newValue)}</span>
                  </div>
                  <div className="fix-reason">{fix.reason}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="validator-column">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 className="validator-header">3. Auto-Fixed Version</h2>
          <div className="mode-toggle" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
              }}
            >
              <label htmlFor="cr-slider" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563' }}>
                Target CR: {targetCR}
              </label>
              <input
                id="cr-slider"
                type="range"
                min="1"
                max="20"
                value={targetCR}
                onChange={(e) => setTargetCR(parseInt(e.target.value, 10))}
                style={{ width: 100 }}
              />
            </div>

            <div style={{ display: 'flex', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', padding: '0.25rem' }}>
              <button
                onClick={() => setFixMode('enforce_cr')}
                style={{
                  backgroundColor: fixMode === 'enforce_cr' ? 'white' : 'transparent',
                  color: fixMode === 'enforce_cr' ? '#1d4ed8' : '#4b5563',
                  fontWeight: fixMode === 'enforce_cr' ? 'bold' : 'normal',
                  boxShadow: fixMode === 'enforce_cr' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Keep CR, downgrade stats"
              >
                Design Mode
              </button>
              <button
                onClick={() => setFixMode('fix_math')}
                style={{
                  backgroundColor: fixMode === 'fix_math' ? 'white' : 'transparent',
                  color: fixMode === 'fix_math' ? '#1d4ed8' : '#4b5563',
                  fontWeight: fixMode === 'fix_math' ? 'bold' : 'normal',
                  boxShadow: fixMode === 'fix_math' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Keep stats, update CR label"
              >
                Audit Mode
              </button>
            </div>
          </div>
        </div>

        <div className="output-area">
          {fixedBlock ? (
            <pre className="output-pre">{formatPF1eStatBlock(fixedBlock)}</pre>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Fixes will appear here.</p>
          )}
        </div>

        <button
          onClick={() => fixedBlock && navigator.clipboard.writeText(formatPF1eStatBlock(fixedBlock))}
          className="copy-btn"
          disabled={!fixedBlock}
          style={{ opacity: fixedBlock ? 1 : 0.6, cursor: fixedBlock ? 'pointer' : 'not-allowed' }}
        >
          📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
};
