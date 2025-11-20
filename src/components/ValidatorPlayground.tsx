import React, { useState, useEffect } from 'react';
import { parsePF1eStatBlock } from '../lib/pf1e-parser';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { autoFixStatBlock, FixMode, FixLogEntry } from '../engine/autoFixer';
import { scaleCreature } from '../engine/creatureScaler';
import { XP_Table } from '../rules/pf1e-data-tables';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { ValidatorDisplay } from './ValidatorDisplay';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';
import './ValidatorPlayground.css';

const SAMPLE_TEXT = `Fire Beetle
CR 1
XP 400
N Small Vermin
Init +0; Senses Darkvision 60 ft.; Perception +0
DEFENSE
AC 12, touch 11, flat-footed 12
hp 50 (1d8+46)
Fort +2, Ref +0, Will +0
Immune mind-affecting effects
OFFENSE
Speed 30 ft., fly 30 ft. (poor)
Melee bite +1 (1d4)
Special Abilities Luminescence
STATISTICS
Str 10, Dex 11, Con 11, Int -, Wis 10, Cha 7
Base Atk +0; CMB -1; CMD 9
Feats None
Treasure None`;

export const ValidatorPlayground: React.FC = () => {
  const [rawInput, setRawInput] = useState(SAMPLE_TEXT);
  const [parsedBlock, setParsedBlock] = useState<PF1eStatBlock | null>(null);
  const [targetCR, setTargetCR] = useState<number>(1); // NEW: Target CR State
  const [fixMode, setFixMode] = useState<FixMode>('enforce_cr'); // Changed default from 'fix_math'
  const [fixedBlock, setFixedBlock] = useState<PF1eStatBlock | null>(null);
  const [fixLogs, setFixLogs] = useState<FixLogEntry[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Reset Target CR when a new block is parsed
  // REMOVED: This logic is now inside the parsing effect to avoid race conditions
  // useEffect(() => {
  //     if (parsedBlock) {
  //         // Try to parse CR as integer, default to 1
  //         const crNum = parseInt(parsedBlock.cr as string) || 1;
  //         setTargetCR(crNum);
  //     }
  // }, [parsedBlock]);

  useEffect(() => {
    if (!rawInput.trim()) {
        setParsedBlock(null);
        setFixedBlock(null);
        setValidationResult(null);
        setFixLogs([]);
        return;
    }

    try {
      // 1. Parse
      const parsed = parsePF1eStatBlock(rawInput);
      setParsedBlock(parsed);
      
      // Reset Target CR to match the new input
      // We use a heuristic: if the parsed CR is a simple number, use it.
      // If it's "1/2", use 1 (since our slider is 1-20).
      const crNum = parseInt(parsed.cr as string) || 1;
      setTargetCR(crNum);

    } catch (e) {
      console.error(e);
    }
  }, [rawInput]);

  // NEW: Effect to handle Scaling & Fixing & Validating
  useEffect(() => {
      if (!parsedBlock) return;

      let workingBlock = JSON.parse(JSON.stringify(parsedBlock)) as PF1eStatBlock;
      const currentLogs: FixLogEntry[] = [];

      // A. SCALING
      // We only scale if the Target CR (slider) is different from the Parsed CR.
      // We need to handle the "1/2" vs "1" case.
      const parsedCRStr = parsedBlock.cr as string;
      const targetCRStr = targetCR.toString();
      
      // Simple check: if they differ loosely. 
      // Note: parsedCR might be "1/2", targetCR is "1". 
      // If we want to support fractional sliders later, we need better logic.
      // For now, if parsed is "1/2" and target is 1, we scale.
      
      if (parsedCRStr !== targetCRStr) {
          const targetXP = XP_Table[targetCRStr];
          if (targetXP) {
              const { block: scaled, changes } = scaleCreature(workingBlock, targetXP);
              workingBlock = scaled;
              changes.forEach(c => currentLogs.push({
                  feature: 'Creature Scaler',
                  oldValue: parsedCRStr,
                  newValue: targetCRStr,
                  reason: c
              }));
          }
      }

      // B. AUTO-FIX
      const { block: fixed, fixes } = autoFixStatBlock(workingBlock, fixMode);
      setFixedBlock(fixed);
      setFixLogs([...currentLogs, ...fixes]);

      // C. VALIDATE
      // We validate the FIXED block to show the "Happy Path" by default.
      // If the user wants to see errors, they can look at the logs or we can add a toggle later.
      // The user requested: "Validation Panel immediately shows a PASS (because it's auditing the fixed version)."
      const vBasics = validateBasics(fixed);
      const vBench = validateBenchmarks(fixed);
      const vEcon = validateEconomy(fixed);

      const combined: ValidationResult = {
        valid: vBasics.valid && vBench.valid && vEcon.valid,
        status: (vBasics.status === 'FAIL' || vEcon.status === 'FAIL') ? 'FAIL' 
              : (vBasics.status === 'WARN' || vEcon.status === 'WARN' || vBench.status === 'WARN') ? 'WARN' 
              : 'PASS',
        messages: [...vBasics.messages, ...vBench.messages, ...vEcon.messages]
      };
      setValidationResult(combined);

  }, [parsedBlock, targetCR, fixMode]);

  return (
    <div className="validator-playground">
      {/* COLUMN 1: RAW INPUT */}
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

      {/* COLUMN 2: AUDIT & LOGS */}
      <div className="validator-scroll-area">
        <div>
            <h3 className="validator-header">2. Rules Lawyer Audit (v2.1)</h3>
            {parsedBlock && validationResult ? (
            <ValidatorDisplay statBlock={parsedBlock} validation={validationResult} />
            ) : null}
        </div>

        {/* NEW: FIX REPORT */}
        {fixLogs.length > 0 && (
            <div className="fix-report">
                <h4 className="fix-report-header">
                    🛠️ Auto-Fixes Applied ({fixMode === 'fix_math' ? 'Audit Mode' : 'Design Mode'})
                </h4>
                <ul className="fix-list">
                    {fixLogs.map((fix, i) => (
                        <li key={i} className="fix-item">
                            <div style={{ fontWeight: 600 }}>{fix.feature}</div>
                            <div className="fix-change-row">
                                <span className="fix-old">{fix.oldValue}</span>
                                <span>→</span>
                                <span className="fix-new">{fix.newValue}</span>
                            </div>
                            <div className="fix-reason">{fix.reason}</div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {/* COLUMN 3: FIX OUTPUT (With Toggle) */}
      <div className="validator-column">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 className="validator-header">3. Auto-Fixed Version</h2>
            
            {/* MODE TOGGLE */}
            <div className="mode-toggle" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* NEW: CR SLIDER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                    <label htmlFor="cr-slider" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563' }}>
                        Target CR: {targetCR}
                    </label>
                    <input 
                        id="cr-slider"
                        type="range" 
                        min="1" 
                        max="20" 
                        value={targetCR} 
                        onChange={(e) => setTargetCR(parseInt(e.target.value))}
                        style={{ width: '100px' }}
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
                            cursor: 'pointer'
                        }}
                        title="Keep CR, Downgrade Stats"
                    >
                        Design Mode (Enforce CR)
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
                            cursor: 'pointer'
                        }}
                        title="Keep Stats, Update CR"
                    >
                        Audit Mode (Fix Math)
                    </button>
                </div>
            </div>
         </div>
         
         <div className="output-area">
            {fixedBlock ? (
                <pre className="output-pre">
                    {formatPF1eStatBlock(fixedBlock)}
                </pre>
            ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Fixes will appear here.</p>
            )}
        </div>
        
        <button 
            onClick={() => fixedBlock && navigator.clipboard.writeText(formatPF1eStatBlock(fixedBlock))}
            className="copy-btn"
        >
            📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
};
