import React, { useMemo, useState } from 'react';
import FoundationBuilder from './foundation-builder';
import { seedPrompt } from './narrative-weaver/AtomicPrompt';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { XP_Table } from '../rules/pf1e-data-tables';
import { PF1eStatBlock, ValidationMessage } from '../types/PF1eStatBlock';

const MODULES = [
  'Foundation',
  'Mechanics',
  'Narrative',
  'Treasury',
];

export type ArchitectState = {
  name: string;
  targetCR: number;
  hd: number;
  role: string;
  motivation: string;
  treasureType: string;
  buildPath: 'Monster' | 'NPC' | 'From-Scratch';
};

const initialState: ArchitectState = {
  name: 'New Creature',
  targetCR: 1,
  hd: 1,
  role: 'Villain',
  motivation: 'power',
  treasureType: 'Standard',
  buildPath: 'Monster',
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

  const validationBlock: PF1eStatBlock = useMemo(() => ({
    name: state.name || 'Creature',
    cr: state.targetCR.toString() as any,
    xp: XP_Table[state.targetCR.toString()] || 0,
    size: 'Medium',
    type: 'Animal',
    racialHD: state.hd,
    hp: Math.max(1, state.hd * 8),
    hp_claimed: Math.max(1, state.hd * 8),
    ac: 10,
    ac_claimed: 10,
    fort: 0,
    ref: 0,
    will: 0,
    fort_save_claimed: 0,
    ref_save_claimed: 0,
    will_save_claimed: 0,
    bab: 0,
    bab_claimed: 0,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    feats: [],
    treasureType: state.treasureType as any,
  }), [state.hd, state.name, state.targetCR, state.treasureType]);

  const basicsCheck = useMemo(() => validateBasics(validationBlock), [validationBlock]);
  const benchmarkCheck = useMemo(() => validateBenchmarks(validationBlock), [validationBlock]);
  const economyCheck = useMemo(() => validateEconomy(validationBlock), [validationBlock]);

  const allRulesMessages = useMemo(
    () => [...(basicsCheck.messages || []), ...(benchmarkCheck.messages || []), ...(economyCheck.messages || [])],
    [basicsCheck.messages, benchmarkCheck.messages, economyCheck.messages]
  );

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

  const nextLabel = step < MODULES.length - 1 ? `Next: ${MODULES[step + 1]}` : 'Finish';
  const prevLabel = step === 0 ? 'Back' : `Back to ${MODULES[step - 1]}`;
  const derivedHP = Math.max(1, state.hd * 8);

  const snapshotTags = useMemo(
    () => [
      { label: `CR ${state.targetCR}`, tone: '#312e81' },
      { label: state.buildPath, tone: '#0f766e' },
      { label: state.role || 'Role TBD', tone: '#9a3412' },
      { label: state.treasureType || 'Treasure TBD', tone: '#1d4ed8' },
      { label: `Rules: ${overallRulesStatus}`, tone: pillToneForStatus(overallRulesStatus) },
    ],
    [overallRulesStatus, state.buildPath, state.role, state.targetCR, state.treasureType],
  );

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

          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {MODULES.map((mod, i) => (
              <button
                key={mod}
                style={pillButtonStyle(step === i)}
                onClick={() => setStep(i)}
              >
                {mod}
              </button>
            ))}
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(260px, 1fr)', gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              {step === 0 && (
                <>
                  <FoundationBuilder
                    name={state.name}
                    targetCR={state.targetCR}
                    buildPath={state.buildPath}
                    onNameChange={name => setState(s => ({ ...s, name }))}
                    onTargetCRChange={targetCR => setState(s => ({ ...s, targetCR }))}
                    onBuildPathChange={buildPath => setState(s => ({ ...s, buildPath }))}
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
                  <p style={{ margin: 0, color: '#4b5563' }}>Tune hit dice and see quick math.</p>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                      Hit Dice
                      <input
                        type="number"
                        value={state.hd}
                        min={1}
                        max={20}
                        onChange={e => setState(s => ({ ...s, hd: Number(e.target.value) }))}
                        style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
                      />
                    </label>
                    <div style={{ color: '#111827', fontWeight: 600 }}>Calculated HP: <span style={{ color: '#4338ca' }}>{state.hd * 8}</span> (placeholder)</div>
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
                <div style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                  <div><strong>HD:</strong> {state.hd}d8</div>
                  <div><strong>HP (est):</strong> {derivedHP}</div>
                  <div><strong>AC (placeholder):</strong> 10</div>
                  <div><strong>Saves (placeholder):</strong> Fort 0 / Ref 0 / Will 0</div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Rules Lawyer Workbench</div>
                <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 8 }}>
                  Live checks from Basics, Benchmarks, and Economy.
                </div>
                {allRulesMessages.filter(m => m.severity !== 'note').length === 0 ? (
                  <div style={{ color: '#15803d', fontWeight: 600 }}>No issues detected for current inputs.</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
                    {allRulesMessages
                      .filter(m => m.severity !== 'note')
                      .map((msg, idx) => (
                        <li key={idx} style={{ color: msg.severity === 'critical' ? '#b91c1c' : '#b45309' }}>
                          <strong>{msg.category}:</strong> {msg.message}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>

          <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              {step === 0 && 'Set name, path, and CR, then continue to Mechanics.'}
              {step === 1 && 'Tune hit dice, then move to Narrative.'}
              {step === 2 && 'Set role and motivation, then pick treasure.'}
              {step === 3 && 'Finish treasury details or go back to adjust earlier steps.'}
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
