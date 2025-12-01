import React, { useMemo, useState } from 'react';
import FoundationBuilder from './foundation-builder';
import { seedPrompt } from './narrative-weaver/AtomicPrompt';
import { calculateHP } from './mechanics-engine';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { XP_Table } from '../rules/pf1e-data-tables';
import { PF1eStatBlock, ValidationSeverity } from '../types/PF1eStatBlock';

// Creature type definitions with mechanical implications
const CREATURE_TYPES = {
  Aberration: { hd: 'd8', bab: 'medium', goodSaves: ['will'], skillRanks: 4, traits: 'Bizarre anatomy' },
  Animal: { hd: 'd8', bab: 'medium', goodSaves: ['fort', 'ref'], skillRanks: 2, traits: 'Low-light vision, scent' },
  Construct: { hd: 'd10', bab: 'fast', goodSaves: [], skillRanks: 2, traits: 'Immune to mind-affecting, poison, death effects' },
  Dragon: { hd: 'd12', bab: 'fast', goodSaves: ['fort', 'ref', 'will'], skillRanks: 6, traits: 'Immune to sleep, paralysis' },
  Fey: { hd: 'd6', bab: 'slow', goodSaves: ['ref', 'will'], skillRanks: 6, traits: 'Often forest/underground' },
  Humanoid: { hd: 'd8', bab: 'medium', goodSaves: ['any'], skillRanks: 2, traits: 'Breathe, eat, sleep' },
  'Magical Beast': { hd: 'd10', bab: 'fast', goodSaves: ['fort', 'ref'], skillRanks: 2, traits: 'Darkvision, low-light vision' },
  'Monstrous Humanoid': { hd: 'd10', bab: 'fast', goodSaves: ['ref', 'will'], skillRanks: 4, traits: 'Darkvision, monstrous features' },
  Ooze: { hd: 'd8', bab: 'medium', goodSaves: [], skillRanks: 2, traits: 'Mindless, immune to precision damage' },
  Outsider: { hd: 'd10', bab: 'fast', goodSaves: ['any', 'any'], skillRanks: 6, traits: 'From other planes' },
  Plant: { hd: 'd8', bab: 'medium', goodSaves: ['fort'], skillRanks: 2, traits: 'Immune to mind-affecting, sleep, poison' },
  Undead: { hd: 'd8', bab: 'medium', goodSaves: ['will'], skillRanks: 4, traits: 'Immune to critical hits, poison, death effects' },
  Vermin: { hd: 'd8', bab: 'medium', goodSaves: ['fort'], skillRanks: 2, traits: 'Mindless, immune to mind-affecting' },
} as const;

type CreatureTypeKey = keyof typeof CREATURE_TYPES;

const calculateBAB = (hd: number, progression: 'slow' | 'medium' | 'fast'): number => {
  if (progression === 'slow') return Math.floor(hd / 2);
  if (progression === 'medium') return Math.floor((hd * 3) / 4);
  return hd; // fast
};

const PRESETS = {
  NastyBeast: {
    name: 'NastyBeast',
    targetCR: 1,
    creatureType: 'Monstrous Humanoid',
    hd: 2,
    str: 14,
    dex: 12,
    con: 14,
    int: 10,
    wis: 10,
    cha: 10,
    ac: 12,
    bab: 2,
    fort: 2,
    ref: 2,
    will: 0,
    selectedFeat: 'Power Attack',
    role: 'Villain',
    motivation: 'power',
    treasureType: 'Standard',
    buildPath: 'Monster' as const,
    size: 'Medium' as const,
    alignment: 'Neutral' as const,
  },
  LowestScores: {
    name: 'LowestScores',
    targetCR: 1,
    creatureType: 'Humanoid',
    hd: 1,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    ac: 10,
    bab: 0,
    fort: 0,
    ref: 0,
    will: 0,
    selectedFeat: '',
    role: 'Minion',
    motivation: 'survive',
    treasureType: 'None',
    buildPath: 'Monster' as const,
    size: 'Medium' as const,
    alignment: 'Neutral' as const,
    template: null,
  },
} as const;

const suggestionForAlignment = (role: string, motivation: string) => {
    if (role === 'Villain' && motivation === 'power') {
      return { suggested: 'Evil', info: 'Villain + Power strongly suggests an Evil alignment (Lawful, Neutral, or Chaotic Evil depending on the approach).', example: 'LE / NE / CE' };
    }
    if (role === 'Villain') {
      return { suggested: 'Likely Evil', info: 'Villain role often suggests malevolent intent and alignment leaning evil.' };
    }
    return { suggested: 'Varies', info: 'Role and motivation do not strongly imply a specific alignment.' };
    };

const MODULES = [
  'Foundation',
  'Mechanics',
  'Narrative',
  'Treasury',
];

type StepStatus = 'complete' | 'current' | 'upcoming';

const progressStepStyle = (status: StepStatus): React.CSSProperties => {
  const palette = {
    complete: { bg: '#e0e7ff', border: '#c7d2fe', color: '#312e81' },
    current: { bg: '#312e81', border: '#312e81', color: '#fff' },
    upcoming: { bg: '#f1f5f9', border: '#e2e8f0', color: '#64748b' },
  } as const;

  const colors = palette[status];
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.color,
    minWidth: 160,
    justifyContent: 'flex-start',
    transition: 'box-shadow 0.2s ease',
    boxShadow: status === 'current' ? '0 8px 20px #312e8118' : 'none',
    cursor: 'pointer',
  };
};

const severityPalette: Record<ValidationSeverity, { icon: string; color: string; bg: string; border: string }> = {
  critical: { icon: '⛔', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  warning: { icon: '⚠️', color: '#b45309', bg: '#fffbeb', border: '#fcd34d66' },
  note: { icon: 'ℹ️', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

type QuickFixKey = 'alignCrHd';

type RuleActionHintConfig = {
  guidance: string;
  ctaLabel?: string;
  ctaStep?: number;
  quickFixKey?: QuickFixKey;
  quickFixLabel?: string;
};

const categoryActionConfig: Record<string, RuleActionHintConfig> = {
  structure: {
    guidance: 'CR and Hit Dice should stay in sync to avoid illegal math.',
    quickFixKey: 'alignCrHd',
    quickFixLabel: 'Match CR to HD',
    ctaLabel: 'Open Foundation',
    ctaStep: 0,
  },
  basics: {
    guidance: 'Review feats, XP, and chassis math inside Mechanics.',
    ctaLabel: 'Go to Mechanics',
    ctaStep: 1,
  },
  benchmarks: {
    guidance: 'Tweak CR or HD until HP/AC benchmarks land in the safe range.',
    ctaLabel: 'Adjust Mechanics',
    ctaStep: 1,
  },
  economy: {
    guidance: 'Adjust treasure tier or gear in the Treasury step.',
    ctaLabel: 'Open Treasury',
    ctaStep: 3,
  },
};

export type ArchitectState = {
  name: string;
  targetCR: number;
  creatureType: CreatureTypeKey;
  size: 'Tiny'|'Small'|'Medium'|'Large'|'Huge'|'Gargantuan';
  hd: number;
  hdDie?: 'd6'|'d8'|'d10'|'d12';
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  ac: number;
  bab: number;
  fort: number;
  ref: number;
  will: number;
  template?: string | null;
  selectedFeat: string;
  role: string;
  motivation: string;
  treasureType: string;
  alignment: string;
  buildPath: 'Monster' | 'NPC' | 'From-Scratch';
};

const initialState: ArchitectState = {
  name: 'New Creature',
  targetCR: 1,
  creatureType: 'Humanoid',
  size: 'Medium',
  hd: 2,
  hdDie: 'd8',
  str: 10,
  dex: 10,
  con: 14,
  int: 10,
  wis: 10,
  cha: 10,
  ac: 12,
  bab: 1,
  fort: 2,
  ref: 0,
  will: 0,
  selectedFeat: 'Improved Initiative',
  role: 'Villain',
  motivation: 'power',
  treasureType: 'Standard',
  alignment: 'Neutral',
  buildPath: 'Monster',
  template: null,
};

const calculateFeatCount = (hd: number, int: number): number => {
  if (int <= 0) return 0;
  return 1 + Math.floor((hd - 1) / 2);
};

const pillButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 999,
  border: '1px solid',
  borderColor: active ? '#4338ca' : '#e5e7eb',
  background: active ? '#eef2ff' : '#fff',
  color: active ? '#312e81' : '#111827',
  fontWeight: active ? 700 : 600,
  cursor: 'pointer',
  boxShadow: active ? '0 1px 6px #4338ca1c' : '0 1px 2px #0000000d',
});

export const BestiaryArchitectApp: React.FC = () => {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(initialState);

  const TEMPLATES: Record<string, (s: ArchitectState) => Partial<ArchitectState>> = {
    None: () => ({ template: null }),
    'Advanced Creature': s => ({ template: 'Advanced Creature', targetCR: Math.min(25, s.targetCR + 1), str: s.str + 4, dex: s.dex + 4, con: s.con + 4, int: Math.max(s.int, 3) + 4, wis: s.wis + 4, cha: s.cha + 4, ac: s.ac + 4 }),
    'Giant Creature': s => ({ template: 'Giant Creature', targetCR: Math.min(25, s.targetCR + 1), str: s.str + 4, con: s.con + 4, dex: Math.max(1, s.dex - 2), ac: s.ac + 3 }),
    'Young Creature': s => ({ template: 'Young Creature', targetCR: Math.max(1, s.targetCR - 1), str: Math.max(1, s.str - 4), con: Math.max(1, s.con - 4), dex: s.dex + 4, ac: Math.max(0, s.ac - 2) }),
    'Celestial Creature': s => ({ template: 'Celestial Creature', targetCR: s.hd >= 5 ? Math.min(25, s.targetCR + 1) : s.targetCR, ac: s.ac + 0 }),
    'Fiendish Creature': s => ({ template: 'Fiendish Creature', targetCR: s.hd >= 5 ? Math.min(25, s.targetCR + 1) : s.targetCR, ac: s.ac + 0 }),
    Skeleton: s => ({ template: 'Skeleton', creatureType: 'Undead', targetCR: s.targetCR, hd: s.hd, str: s.str, dex: s.dex, con: s.con, cha: s.cha, ac: s.ac + 2 }),
    Zombie: s => ({ template: 'Zombie', creatureType: 'Undead', targetCR: s.targetCR, ac: s.ac }),
    'Half-Dragon': s => ({ template: 'Half-Dragon', str: s.str + 8, con: s.con + 6, int: s.int + 2, cha: s.cha + 2 }),
    'Half-Fiend': s => ({ template: 'Half-Fiend', str: s.str + 2, con: s.con + 2, int: s.int + 2, cha: s.cha + 2 }),
    Lich: s => ({ template: 'Lich', creatureType: 'Undead', targetCR: Math.min(25, s.targetCR + 2) }),
    Ghost: s => ({ template: 'Ghost', creatureType: 'Undead', targetCR: Math.min(25, s.targetCR + 1) }),
  };

  const applyTemplate = (templateName: string) => {
    const op = TEMPLATES[templateName];
    if (!op) return;
    setState(s => {
      const changes = op(s);
      // Apply template changes in the recommended sequence: size -> ability adjustments -> HP/feats/derived stats (HP/featcalc recomputed via derived values)
      const updated = { ...s, ...changes } as ArchitectState;
      // Recompute callback values where we have explicit derived fields (bab may need to be adapted later)
      updated.bab = calculateBAB(updated.hd, CREATURE_TYPES[updated.creatureType].bab as any);
      // Ensure derived hp/feats will update through existing calculation on render
      return updated;
    });
  };

  const nextLabel = step < MODULES.length - 1 ? `Next: ${MODULES[step + 1]}` : 'Finish';
  const prevLabel = step === 0 ? 'Back' : `Back to ${MODULES[step - 1]}`;
  const derivedHP = calculateHP(state.hd, state.con);
  const featCount = calculateFeatCount(state.hd, state.int);
  
  const typeInfo = CREATURE_TYPES[state.creatureType];
  const suggestedBAB = calculateBAB(state.hd, typeInfo.bab);
  const babMismatch = state.bab !== suggestedBAB;

  const validationBlock: PF1eStatBlock = useMemo(() => ({
    name: state.name || 'Creature',
    cr: state.targetCR.toString() as any,
    xp: XP_Table[state.targetCR.toString()] || 0,
    size: state.size,
    type: state.creatureType,
    racialHD: state.hd,
    hp: calculateHP(state.hd, state.con),
    hp_claimed: calculateHP(state.hd, state.con),
    ac: state.ac,
    ac_claimed: state.ac,
    fort: state.fort,
    ref: state.ref,
    will: state.will,
    fort_save_claimed: state.fort,
    ref_save_claimed: state.ref,
    will_save_claimed: state.will,
    bab: state.bab,
    bab_claimed: state.bab,
    str: state.str,
    dex: state.dex,
    con: state.con,
    int: state.int,
    wis: state.wis,
    cha: state.cha,
    feats: Array.from({ length: featCount }, (_, i) => state.selectedFeat || `Feat ${i + 1}`),
    treasureType: state.treasureType as any,
  }), [state.hd, state.name, state.targetCR, state.treasureType, state.creatureType, state.str, state.dex, state.con, state.int, state.wis, state.cha, state.ac, state.bab, state.fort, state.ref, state.will, state.selectedFeat, featCount]);

  const basicsCheck = useMemo(() => validateBasics(validationBlock), [validationBlock]);
  const benchmarkCheck = useMemo(() => validateBenchmarks(validationBlock), [validationBlock]);
  const economyCheck = useMemo(() => validateEconomy(validationBlock), [validationBlock]);

  const allRulesMessages = useMemo(
    () => [...(basicsCheck.messages || []), ...(benchmarkCheck.messages || []), ...(economyCheck.messages || [])],
    [basicsCheck.messages, benchmarkCheck.messages, economyCheck.messages]
  );

  const actionableMessages = useMemo(() => allRulesMessages.filter(m => m.severity !== 'note'), [allRulesMessages]);

  const overallRulesStatus = useMemo(() => {
    if (allRulesMessages.some(m => m.severity === 'critical')) return 'FAIL';
    if (allRulesMessages.some(m => m.severity === 'warning')) return 'WARN';
    return 'PASS';
  }, [allRulesMessages]);

  const structuralMessages = basicsCheck.messages.filter(m => m.category === 'structure');
  const mechanicMessages = allRulesMessages.filter(m => ['structure', 'benchmarks', 'basics'].includes(m.category));
  const economyMessages = allRulesMessages.filter(m => m.category === 'economy');
  const mechanicNonStructural = mechanicMessages.filter(m => m.category !== 'structure' && m.severity !== 'note');

  const pillToneForStatus = (status: string) => {
    if (status === 'FAIL') return '#b91c1c';
    if (status === 'WARN') return '#b45309';
    return '#15803d';
  };

  const canProceed = useMemo(() => {
    if (step === 0) {
      return state.name.trim().length > 0;
    }
    return true;
  }, [state.name, step]);

  const snapshotTags = useMemo(
    () => [
      { label: `CR ${state.targetCR}`, tone: '#312e81' },
      { label: `${state.size}`, tone: '#0f766e' },
      { label: state.creatureType, tone: '#0f766e' },
      { label: state.buildPath, tone: '#7c2d12' },
      { label: state.role || 'Role TBD', tone: '#9a3412' },
      { label: state.treasureType || 'Treasure TBD', tone: '#1d4ed8' },
      { label: `Align: ${state.alignment}`, tone: '#a21caf' },
      { label: `Rules: ${overallRulesStatus}`, tone: pillToneForStatus(overallRulesStatus) },
    ],
    [overallRulesStatus, state.buildPath, state.creatureType, state.role, state.targetCR, state.treasureType],
  );

  const handleRuleNavigation = (targetStep?: number) => {
    if (typeof targetStep === 'number') {
      setStep(targetStep);
    }
  };

  const loadPreset = (presetName: 'NastyBeast' | 'LowestScores') => {
      const preset = PRESETS[presetName];
      setState(s => ({ ...s, ...preset } as ArchitectState));
    };

  const runQuickFix = (key: QuickFixKey) => {
    switch (key) {
      case 'alignCrHd':
        setState(s => ({ ...s, targetCR: Math.min(25, Math.max(1, s.hd)) }));
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eef2ff)' }}>
      <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 16px 48px' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 12px 40px #0f172a1a', padding: 24, border: '1px solid #e5e7eb' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div>
              <h1 style={{ margin: '0 0 4px' }}>Bestiary Architect</h1>
              <div style={{ color: '#6b7280' }}>Interactive builder for Pathfinder monsters and NPCs</div>
            </div>
            <div style={{ color: '#6b7280', fontWeight: 600, fontSize: 13 }}>Step {step + 1} of {MODULES.length}</div>
          </header>

          <nav style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {MODULES.map((mod, i) => {
                const status: StepStatus = i < step ? 'complete' : i === step ? 'current' : 'upcoming';
                return (
                  <React.Fragment key={mod}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      style={progressStepStyle(status)}
                      aria-current={status === 'current' ? 'step' : undefined}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: status === 'current' ? '2px solid #fff' : '2px solid transparent',
                          background: status === 'current' ? '#4338ca' : status === 'complete' ? '#c7d2fe' : '#fff',
                          color: status === 'current' ? '#fff' : status === 'complete' ? '#312e81' : '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>Step {i + 1}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{mod}</div>
                      </div>
                    </button>
                    {i < MODULES.length - 1 && (
                      <div
                        aria-hidden
                        style={{
                          alignSelf: 'center',
                          flexGrow: 1,
                          minWidth: 30,
                          height: 2,
                          background: i < step ? '#c7d2fe' : '#e2e8f0',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(260px, 1fr)', gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              {step === 0 && (
                <>
                  <FoundationBuilder
                    name={state.name}
                    targetCR={state.targetCR}
                    creatureType={state.creatureType}
                    size={state.size}
                    hd={state.hd}
                    str={state.str}
                    dex={state.dex}
                    con={state.con}
                    int={state.int}
                    wis={state.wis}
                    cha={state.cha}
                    buildPath={state.buildPath}
                    onNameChange={name => setState(s => ({ ...s, name }))}
                    onTargetCRChange={targetCR => setState(s => ({ ...s, targetCR }))}
                    onCreatureTypeChange={creatureType => setState(s => ({ ...s, creatureType: creatureType as CreatureTypeKey }))}
                    onHdChange={hd => setState(s => ({ ...s, hd }))}
                    hdDie={state.hdDie}
                    onHdDieChange={hdDie => setState(s => ({ ...s, hdDie }))}
                    onStrChange={str => { console.debug('[BestiaryArchitectApp] onStrChange ->', str); setState(s => ({ ...s, str })); }}
                    onDexChange={dex => { console.debug('[BestiaryArchitectApp] onDexChange ->', dex); setState(s => ({ ...s, dex })); }}
                    onConChange={con => { console.debug('[BestiaryArchitectApp] onConChange ->', con); setState(s => ({ ...s, con })); }}
                    onIntChange={int => setState(s => ({ ...s, int }))}
                    onWisChange={wis => setState(s => ({ ...s, wis }))}
                    onChaChange={cha => setState(s => ({ ...s, cha }))}
                    onBuildPathChange={buildPath => setState(s => ({ ...s, buildPath }))}
                    onLoadPreset={loadPreset}
                    onApplyTemplate={applyTemplate}
                    template={state.template}
                    onTemplateChange={next => setState(s => ({ ...s, template: next }))}
                    onSizeChange={size => setState(s => ({ ...s, size }))}
                  />
                  {structuralMessages.length > 0 && (
                    <div style={{ border: '1px solid #f59e0b', background: '#fffbeb', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 6 }}>Rules Lawyer: Structural mismatch</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#92400e' }}>
                        {structuralMessages.map((msg, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            {msg.message} {msg.expected ? `(Expected: ${msg.expected})` : ''} {msg.actual ? `(Actual: ${msg.actual})` : ''}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => setState(s => ({ ...s, targetCR: Math.min(25, s.hd) }))}
                        style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #d97706', background: '#fef3c7', color: '#92400e', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Adjust CR to HD (quick fix)
                      </button>
                    </div>
                  )}
                </>
              )}

              {step === 1 && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <h2 style={{ margin: 0 }}>Mechanics Engine</h2>
                  <p style={{ margin: 0, color: '#4b5563' }}>Align stats to your creature type. Tune AC, refine BAB, select feats, and verify synergy.</p>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ background: '#f0f9ff', border: '1px solid #38bdf8', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: 6 }}>Type: {state.creatureType}</div>
                        <div style={{ fontSize: 13, color: '#0c4a6e' }}>
                          <strong>Expected Mechanics:</strong> {state.hdDie || typeInfo.hd} HD, {typeInfo.bab} BAB progression (suggested +{suggestedBAB}), good saves: {typeInfo.goodSaves.join(', ') || 'none'}, {typeInfo.skillRanks} skill ranks/HD.
                        </div>
                    </div>
                    {babMismatch && (
                      <div style={{ border: '1px solid #7c3aed', background: '#f5f3ff', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>Type-Based BAB Suggestion</div>
                        <div style={{ color: '#6b21a8', marginBottom: 8 }}>
                          Your {state.creatureType} with {state.hd} HD uses <strong>{typeInfo.bab} progression</strong>, suggesting a BAB of <strong>+{suggestedBAB}</strong>. Current BAB: <strong>+{state.bab}</strong>.
                        </div>
                        <button
                          onClick={() => setState(s => ({ ...s, bab: suggestedBAB }))}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #a78bfa', background: '#ede9fe', color: '#5b21b6', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Apply Suggested BAB
                        </button>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                      <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                        AC Base
                        <input
                          type="number"
                          min={10}
                          max={50}
                          value={10 + Math.floor((state.dex - 10) / 2)} // base 10 + dex mod
                          readOnly
                          style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14, background: '#f9fafb' }}
                        />
                      </label>
                      <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                        AC Total
                        <input
                          type="number"
                          min={10}
                          max={50}
                          value={state.ac}
                          onChange={e => setState(s => ({ ...s, ac: Number(e.target.value) }))}
                          style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                        />
                      </label>
                      <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                        BAB
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={state.bab}
                          onChange={e => setState(s => ({ ...s, bab: Number(e.target.value) }))}
                          style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                        />
                      </label>
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ fontWeight: 700 }}>Saving Throws</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                        <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                          Fort
                          <input
                            type="number"
                            value={state.fort}
                            onChange={e => setState(s => ({ ...s, fort: Number(e.target.value) }))}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
                          />
                        </label>
                        <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                          Ref
                          <input
                            type="number"
                            value={state.ref}
                            onChange={e => setState(s => ({ ...s, ref: Number(e.target.value) }))}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
                          />
                        </label>
                        <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                          Will
                          <input
                            type="number"
                            value={state.will}
                            onChange={e => setState(s => ({ ...s, will: Number(e.target.value) }))}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
                          />
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ fontWeight: 700 }}>Feat Selection ({featCount})</div>
                      <select
                        value={state.selectedFeat}
                        onChange={e => setState(s => ({ ...s, selectedFeat: e.target.value }))}
                        style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
                      >
                        <option value="Improved Initiative">Improved Initiative (Villain: Act first in combat)</option>
                        <option value="Power Attack">Power Attack (Melee: Trade accuracy for damage)</option>
                        <option value="Toughness">Toughness (Survivability: +3 HP for 1 HD)</option>
                        <option value="Weapon Focus">Weapon Focus (Melee: +1 on one attack type)</option>
                        <option value="Combat Reflexes">Combat Reflexes (Tactics: Extra AoO per round)</option>
                        <option value="Dodge">Dodge (Defense: +1 AC vs. one opponent)</option>
                      </select>
                      <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                        {state.selectedFeat === 'Improved Initiative'
                          ? '✓ Villain synergy: Act before enemies to control encounter.'
                          : state.selectedFeat === 'Power Attack'
                            ? '✓ Offensive: Boost damage at the cost of accuracy. Pairs well with high BAB or STR.'
                            : state.selectedFeat === 'Toughness'
                              ? '✓ Durability: Gain +3 HP to stay in the fight longer.'
                              : state.selectedFeat === 'Weapon Focus'
                                ? '✓ Accuracy: +1 on attack rolls with one weapon type. Great for low-BAB creatures.'
                                : state.selectedFeat === 'Combat Reflexes'
                                  ? '✓ Tactics: Make extra attacks of opportunity each round. Synergizes with DEX.'
                                  : state.selectedFeat === 'Dodge'
                                    ? '✓ Defense: Gain +1 AC against one foe per round. Stacks with other AC bonuses.'
                                    : 'Choose a feat to see synergy guidance.'}
                      </div>
                    </div>
                    <div style={{ color: '#111827', fontWeight: 600 }}>Calculated HP: <span style={{ color: '#4338ca' }}>{derivedHP}</span> (based on HD and CON)</div>
                    {structuralMessages.length > 0 && (
                      <div style={{ border: '1px solid #f59e0b', background: '#fffbeb', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 6 }}>Rules Lawyer: Structural mismatch</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: '#92400e' }}>
                          {structuralMessages.map((msg, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>
                              {msg.message} {msg.expected ? `(Expected: ${msg.expected})` : ''} {msg.actual ? `(Actual: ${msg.actual})` : ''}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => setState(s => ({ ...s, targetCR: Math.min(25, s.hd) }))}
                          style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #d97706', background: '#fef3c7', color: '#92400e', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Adjust CR to HD (quick fix)
                        </button>
                      </div>
                    )}
                    {mechanicNonStructural.length > 0 && (
                      <div style={{ border: '1px solid #c084fc', background: '#f5f3ff', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: '#6b21a8', marginBottom: 6 }}>Rules Lawyer: Benchmarks</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: '#6b21a8' }}>
                          {mechanicNonStructural.map((msg, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>
                              {msg.message} {msg.expected ? `(Expected: ${msg.expected})` : ''} {msg.actual ? `(Actual: ${msg.actual})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <h2 style={{ margin: 0 }}>Narrative Weaver</h2>
                  <p style={{ margin: 0, color: '#4b5563' }}>Give the creature purpose and tone.</p>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
                    Role
                    <input
                      value={state.role}
                      onChange={e => setState(s => ({ ...s, role: e.target.value }))}
                      placeholder="Villain, Helper, Minion"
                      style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
                    Motivation
                    <input
                      value={state.motivation}
                      onChange={e => setState(s => ({ ...s, motivation: e.target.value }))}
                      placeholder="power, revenge, devotion"
                      style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                    />
                  </label>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <label style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
                      Alignment
                      <select
                        value={state.alignment}
                        onChange={e => setState(s => ({ ...s, alignment: e.target.value }))}
                        style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                      >
                        <option>Lawful Good</option>
                        <option>Neutral Good</option>
                        <option>Chaotic Good</option>
                        <option>Lawful Neutral</option>
                        <option>Neutral</option>
                        <option>Chaotic Neutral</option>
                        <option>Lawful Evil</option>
                        <option>Neutral Evil</option>
                        <option>Chaotic Evil</option>
                      </select>
                    </label>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      <strong>Suggested Alignment:</strong> {suggestionForAlignment(state.role, state.motivation).suggested} — {suggestionForAlignment(state.role, state.motivation).info}
                      <div style={{ marginTop: 6 }}>
                        <button
                          onClick={() => setState(s => ({ ...s, alignment: suggestionForAlignment(s.role, s.motivation).suggested === 'Evil' ? 'Neutral Evil' : suggestionForAlignment(s.role, s.motivation).suggested }))}
                          style={{ marginTop: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5f5', background: '#fff', cursor: 'pointer' }}
                        >
                          Apply Suggested Alignment
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#f5f3ff', border: '1px solid #e0e7ff', padding: 12, borderRadius: 10, color: '#312e81' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Prompt starter</div>
                    <div style={{ fontStyle: 'italic', lineHeight: 1.5 }}>
                      {seedPrompt({ role: (['Villain','Helper','Minion'].includes(state.role) ? state.role as 'Villain'|'Helper'|'Minion' : undefined), motivation: state.motivation })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <h2 style={{ margin: 0 }}>Treasury & Lair</h2>
                  <p style={{ margin: 0, color: '#4b5563' }}>Choose treasure and habitat hooks.</p>
                  <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                    Treasure Type
                    <select
                      value={state.treasureType}
                      onChange={e => setState(s => ({ ...s, treasureType: e.target.value }))}
                      style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                    >
                      <option>Standard</option>
                      <option>Double</option>
                      <option>NPC Gear</option>
                      <option>None</option>
                    </select>
                  </label>
                  <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                    Environment
                    <input placeholder="e.g. temperate forest" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }} />
                  </label>
                  <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                    Organization
                    <input placeholder="solitary, pair, gang" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }} />
                  </label>
                  {economyMessages.filter(m => m.severity !== 'note').length > 0 && (
                    <div style={{ border: '1px solid #f59e0b', background: '#fffbeb', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 6 }}>Rules Lawyer: Economy</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#92400e' }}>
                        {economyMessages
                          .filter(m => m.severity !== 'note')
                          .map((msg, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>
                              {msg.message} {msg.expected ? `(Expected: ${msg.expected})` : ''} {msg.actual ? `(Actual: ${msg.actual})` : ''}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, boxShadow: 'inset 0 1px 0 #fff' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Creature Snapshot</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {snapshotTags.map(tag => (
                  <span
                    key={tag.label}
                    style={{
                      background: `${tag.tone}14`,
                      color: tag.tone,
                      border: `1px solid ${tag.tone}33`,
                      padding: '6px 10px',
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div style={{ display: 'grid', gap: 8, color: '#374151' }}>
                <div><strong>Name:</strong> {state.name}</div>
                <div><strong>Role:</strong> {state.role}</div>
                <div><strong>Motivation:</strong> {state.motivation}</div>
                <div><strong>Treasure:</strong> {state.treasureType}</div>
              </div>
              <div style={{ marginTop: 10, padding: '10px 12px', background: '#ffffff', border: '1px dashed #e5e7eb', borderRadius: 10, display: 'grid', gap: 6, color: '#111827' }}>
                <div style={{ fontWeight: 700 }}>Quick Stats</div>
                <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginBottom: 6 }}>
                  <strong>{state.creatureType}</strong> | {state.hdDie || typeInfo.hd} HD | {typeInfo.bab} BAB | {typeInfo.skillRanks} skill ranks/HD
                </div>
                <div style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                  <div><strong>HD:</strong> {state.hd}{state.hdDie ? ` ${state.hdDie}` : `d${typeInfo.hd.slice(1)}`}</div>
                  <div><strong>Size:</strong> {state.size}</div>
                  <div><strong>HP (est):</strong> {derivedHP}</div>
                  <div><strong>AC:</strong> {state.ac}</div>
                  <div><strong>BAB:</strong> +{state.bab} {babMismatch ? `(type suggests +${suggestedBAB})` : '✓'}</div>
                  <div><strong>Saves:</strong> Fort +{state.fort} / Ref +{state.ref} / Will +{state.will}</div>
                  <div><strong>STR/DEX/CON:</strong> {state.str}/{state.dex}/{state.con}</div>
                  <div><strong>INT/WIS/CHA:</strong> {state.int}/{state.wis}/{state.cha}</div>
                  <div><strong>Feat:</strong> {state.selectedFeat}</div>
                  <div><strong>Alignment:</strong> {state.alignment}</div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Rules Lawyer Workbench</div>
                <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 8 }}>
                  Live checks from Basics, Benchmarks, and Economy.
                </div>
                {actionableMessages.length === 0 ? (
                  <div style={{ color: '#15803d', fontWeight: 600 }}>No issues detected for current inputs.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {actionableMessages.map((msg, idx) => {
                      const severity = severityPalette[msg.severity];
                      const actionConfig = categoryActionConfig[msg.category];
                      const showQuickFix = Boolean(actionConfig?.quickFixKey);
                      const showCTA = actionConfig?.ctaLabel && typeof actionConfig.ctaStep === 'number';
                      return (
                        <div
                          key={`${msg.category}-${idx}`}
                          style={{
                            border: `1px solid ${severity.border}`,
                            background: severity.bg,
                            borderRadius: 12,
                            padding: 12,
                            color: severity.color,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span aria-hidden style={{ fontSize: 18 }}>{severity.icon}</span>
                              <div>
                                <div style={{ fontWeight: 700, textTransform: 'capitalize', color: '#111827' }}>{msg.category}</div>
                                <div style={{ fontSize: 12 }}>{msg.severity.toUpperCase()}</div>
                              </div>
                            </div>
                          </div>
                          <p style={{ margin: '8px 0', color: '#111827' }}>{msg.message}</p>
                          {(msg.expected !== undefined || msg.actual !== undefined) && (
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#0f172a' }}>
                              {msg.expected !== undefined && (
                                <div>
                                  <strong>Expected:</strong> {String(msg.expected)}
                                </div>
                              )}
                              {msg.actual !== undefined && (
                                <div>
                                  <strong>Actual:</strong> {String(msg.actual)}
                                </div>
                              )}
                            </div>
                          )}
                          {actionConfig?.guidance && (
                            <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>{actionConfig.guidance}</div>
                          )}
                          {(showQuickFix || showCTA) && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                              {showQuickFix && actionConfig?.quickFixKey && (
                                <button
                                  type="button"
                                  onClick={() => runQuickFix(actionConfig.quickFixKey!)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #c4b5fd',
                                    background: '#ede9fe',
                                    color: '#4c1d95',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {actionConfig.quickFixLabel || 'Apply quick fix'}
                                </button>
                              )}
                              {showCTA && (
                                <button
                                  type="button"
                                  onClick={() => handleRuleNavigation(actionConfig!.ctaStep)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #cbd5f5',
                                    background: '#fff',
                                    color: '#1e1b4b',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {actionConfig!.ctaLabel}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>
              {step === 0 && 'Complete the foundation card, then jump into Mechanics.'}
              {step === 1 && 'Review mechanics and add special abilities.'}
              {step === 2 && 'Capture story hooks, then define treasure.'}
              {step === 3 && 'Lock in loot or revisit earlier steps as needed.'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                style={{
                  ...pillButtonStyle(false),
                  opacity: step === 0 ? 0.5 : 1,
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {prevLabel}
              </button>
              <button
                onClick={() => setStep(s => Math.min(MODULES.length - 1, s + 1))}
                disabled={!canProceed}
                style={{
                  ...pillButtonStyle(true),
                  background: '#312e81',
                  color: '#fff',
                  borderColor: '#312e81',
                  opacity: canProceed ? 1 : 0.5,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                }}
              >
                {nextLabel}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BestiaryArchitectApp;
