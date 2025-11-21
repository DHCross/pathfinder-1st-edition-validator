import React, { useState, useMemo } from 'react';
import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { scaleCreature } from '../engine/creatureScaler';
import { autoFixStatBlock, FixMode } from '../engine/autoFixer';
import { XP_Table } from '../rules/pf1e-data-tables';
import { ValidatorDisplay } from './ValidatorDisplay';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';

const TEMPLATES: Record<string, Partial<PF1eStatBlock>> = {
  'Fire Beetle': {
    name: 'Fire Beetle',
    cr: '1',
    xp: 400,
    size: 'Small',
    type: 'Vermin',
    racialHD: 1,
    hp: 50,
    str: 10,
    dex: 11,
    con: 11,
    ac: 12,
    bab: 0,
    fort: 2,
    ref: 0,
    will: 0,
  },
  'Chaos-Mutated Toad': {
    name: 'Chaos-Mutated Toad',
    cr: '1',
    xp: 400,
    size: 'Medium',
    type: 'Animal',
    racialHD: 6,
    hp: 120,
    str: 14,
    dex: 12,
    con: 14,
    ac: 12,
    bab: 3,
    fort: 6,
    ref: 2,
    will: 2,
  }
};

export const MonsterBuilderWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [templateKey, setTemplateKey] = useState<string>('Fire Beetle');
  const [crTarget, setCrTarget] = useState<number>(1);
  const [fixMode, setFixMode] = useState<FixMode>('enforce_cr');

  const base = TEMPLATES[templateKey] || {};

  const [customFields, setCustomFields] = useState<Partial<PF1eStatBlock>>({});

  const builtRaw: PF1eStatBlock = useMemo(() => {
    const crStr = (customFields.cr as any) ?? base.cr ?? '1';
    const xpFor = XP_Table[crTarget.toString()] || (base.xp as number) || 400;

    return {
      name: (customFields.name as string) || (base.name as string) || 'New Creature',
      cr: crStr as any,
      xp: xpFor,
      size: (customFields.size as any) || (base.size as any) || 'Medium',
      type: (customFields.type as any) || (base.type as any) || 'Outsider',
      racialHD: (customFields.racialHD as number) || (base.racialHD as number) || 1,
      hp: (customFields.hp as number) || (base.hp as number) || 10,
      str: (customFields.str as number) || (base.str as number) || 10,
      dex: (customFields.dex as number) || (base.dex as number) || 10,
      con: (customFields.con as number) || (base.con as number) || 10,
      ac: (customFields.ac as number) || (base.ac as number) || 10,
      bab: (customFields.bab as number) || (base.bab as number) || 0,
      fort: (customFields.fort as number) || (base.fort as number) || 0,
      ref: (customFields.ref as number) || (base.ref as number) || 0,
      will: (customFields.will as number) || (base.will as number) || 0,
      int: (customFields.int as number) || (base.int as number) || 10,
      wis: (customFields.wis as number) || (base.wis as number) || 10,
      cha: (customFields.cha as number) || (base.cha as number) || 10,
    } as PF1eStatBlock;
  }, [templateKey, customFields, crTarget, base]);

  // Compute scaled & fixed previews
  const { block: scaled } = scaleCreature(builtRaw, XP_Table[crTarget.toString()] || builtRaw.xp || 400);
  const { block: fixed, fixes } = autoFixStatBlock(scaled, fixMode);

  // Validation: structural from raw + audited from fixed/raw
  const rawStructural = validateBasics(builtRaw);
  const audited = fixMode === 'enforce_cr' ? fixed : builtRaw;
  const vBasics = validateBasics(audited);
  const vBench = validateBenchmarks(audited);
  const vEcon = validateEconomy(audited);

  // Merge structural messages (category === 'structure') from raw into final
  const structural = rawStructural.messages.filter(m => m.category === 'structure');
  const allMessages = [...structural, ...vBasics.messages, ...vBench.messages, ...vEcon.messages];

  const validationResult = {
    valid: !allMessages.some(m => m.severity === 'critical'),
    status: allMessages.some(m => m.severity === 'critical') ? 'FAIL' : allMessages.some(m => m.severity === 'warning') ? 'WARN' : 'PASS',
    messages: allMessages,
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Monster Builder Wizard</h2>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Left: Steps */}
        <div style={{ width: 360, borderRight: '1px solid #e5e7eb', paddingRight: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Step {step} / 3</strong>
          </div>

          {step === 1 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600 }}>Choose Template</label>
              <select value={templateKey} onChange={e => setTemplateKey(e.target.value)} style={{ width: '100%', marginTop: 8 }}>
                {Object.keys(TEMPLATES).map(k => <option key={k} value={k}>{k}</option>)}
              </select>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', fontWeight: 600 }}>Creature Name</label>
                <input value={(customFields.name as string) ?? ''} onChange={e => setCustomFields({...customFields, name: e.target.value})} style={{ width: '100%', marginTop: 6 }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600 }}>Target CR: {crTarget}</label>
              <input type="range" min={1} max={20} value={crTarget} onChange={e => setCrTarget(parseInt(e.target.value))} />

              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', fontWeight: 600 }}>Racial HD</label>
                <input type="number" value={(customFields.racialHD as any) ?? builtRaw.racialHD} onChange={e => setCustomFields({...customFields, racialHD: parseInt(e.target.value)})} style={{ width: '100%' }} />
              </div>

              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', fontWeight: 600 }}>HP</label>
                <input type="number" value={(customFields.hp as any) ?? builtRaw.hp} onChange={e => setCustomFields({...customFields, hp: parseInt(e.target.value)})} style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600 }}>Fix Mode</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => setFixMode('enforce_cr')} style={{ backgroundColor: fixMode === 'enforce_cr' ? '#111827' : '#f3f4f6', color: fixMode === 'enforce_cr' ? 'white' : 'black', padding: '6px 10px', border: 'none' }}>Design (Enforce CR)</button>
                <button onClick={() => setFixMode('fix_math')} style={{ backgroundColor: fixMode === 'fix_math' ? '#111827' : '#f3f4f6', color: fixMode === 'fix_math' ? 'white' : 'black', padding: '6px 10px', border: 'none' }}>Audit (Fix Math)</button>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(formatPF1eStatBlock(fixed)); }} style={{ padding: '6px 10px' }}>Copy Fixed Block</button>

                <button
                  onClick={() => {
                    try {
                      const json = JSON.stringify(fixed, null, 2);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      const safeName = (fixed.name || 'creature').replace(/[^a-z0-9\-_]/gi, '_').toLowerCase();
                      a.href = url;
                      a.download = `${safeName}-cr-${fixed.cr || '0'}.json`;
                      // Append, click, and remove to trigger download
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      // Revoke object URL after a short delay
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } catch (e) {
                      // Fallback: copy JSON to clipboard
                      navigator.clipboard.writeText(JSON.stringify(fixed, null, 2));
                    }
                  }}
                  style={{ padding: '6px 10px' }}
                >
                  Download JSON
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>Back</button>
            <button onClick={() => setStep(s => Math.min(3, s + 1))}>{step === 3 ? 'Finish' : 'Next'}</button>
          </div>
        </div>

        {/* Right: Preview & Validation */}
        <div style={{ flex: 1, paddingLeft: 12 }}>
          <h4>Raw Preview</h4>
          <pre style={{ background: '#f9fafb', padding: 10, borderRadius: 6 }}>{formatPF1eStatBlock(builtRaw)}</pre>

          <h4 style={{ marginTop: 12 }}>Auto-Fixed Preview</h4>
          <pre style={{ background: '#f9fafb', padding: 10, borderRadius: 6 }}>{formatPF1eStatBlock(fixed)}</pre>

          <div style={{ marginTop: 12 }}>
            <h4>Validation</h4>
            <ValidatorDisplay statBlock={audited as PF1eStatBlock} validation={validationResult as any} validationTarget={fixMode === 'enforce_cr' ? 'fixed' : 'raw'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonsterBuilderWizard;
