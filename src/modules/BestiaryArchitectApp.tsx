import React, { useState } from 'react';
import FoundationBuilder from './foundation-builder';
import { seedPrompt } from './narrative-weaver/AtomicPrompt';

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
};

const initialState: ArchitectState = {
  name: 'New Creature',
  targetCR: 1,
  hd: 1,
  role: 'Villain',
  motivation: 'power',
  treasureType: 'Standard',
};

export const BestiaryArchitectApp: React.FC = () => {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(initialState);

  return (
    <div style={{ maxWidth: 800, margin: '32px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0001', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Bestiary Architect</h1>
      <nav style={{ marginBottom: 16 }}>
        {MODULES.map((mod, i) => (
          <button
            key={mod}
            style={{ marginRight: 8, fontWeight: step === i ? 'bold' : 'normal' }}
            onClick={() => setStep(i)}
          >
            {mod}
          </button>
        ))}
      </nav>
      {step === 0 && (
        <FoundationBuilder
          name={state.name}
          targetCR={state.targetCR}
        />
      )}
      {step === 1 && (
        <div>
          <h2>Mechanics Engine</h2>
          <p>Hit Dice: <input type="number" value={state.hd} min={1} max={20} onChange={e => setState(s => ({ ...s, hd: Number(e.target.value) }))} /></p>
          <p>Target CR: {state.targetCR}</p>
          <p>Calculated HP: <b>{state.hd * 8}</b> (placeholder)</p>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Narrative Weaver</h2>
          <p>Role: <input value={state.role} onChange={e => setState(s => ({ ...s, role: e.target.value }))} /></p>
          <p>Motivation: <input value={state.motivation} onChange={e => setState(s => ({ ...s, motivation: e.target.value }))} /></p>
          <p>Prompt: <i>{seedPrompt({ role: (['Villain','Helper','Minion'].includes(state.role) ? state.role as 'Villain'|'Helper'|'Minion' : undefined), motivation: state.motivation })}</i></p>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Treasury & Lair</h2>
          <p>Treasure Type: <select value={state.treasureType} onChange={e => setState(s => ({ ...s, treasureType: e.target.value }))}>
            <option>Standard</option>
            <option>Double</option>
            <option>NPC Gear</option>
            <option>None</option>
          </select></p>
          <p>Environment: <input placeholder="e.g. temperate forest" /></p>
          <p>Organization: <input placeholder="e.g. solitary, pair, gang" /></p>
        </div>
      )}
      <div style={{ marginTop: 32, fontSize: 14, color: '#888' }}>
        <b>Current Creature:</b> {JSON.stringify(state)}
      </div>
    </div>
  );
};

export default BestiaryArchitectApp;
