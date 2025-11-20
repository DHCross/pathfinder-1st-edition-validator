import React, { useState, useEffect } from 'react';
import { parsePF1eStatBlock } from '../lib/pf1e-parser';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { autoFixStatBlock, FixMode, FixLogEntry } from '../engine/autoFixer';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { ValidatorDisplay } from './ValidatorDisplay';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';
import './ValidatorPlayground.css';

const SAMPLE_TEXT = `Fire Beetle
CR 1/3
XP 135
N Small vermin
Init +0; Senses Perception +0
DEFENSE
AC 12, touch 11, flat-footed 12
hp 4 (1d8)
Fort +2, Ref +0, Will +0
OFFENSE
Speed 30 ft.
Melee bite +1 (1d4)
STATISTICS
Str 10, Dex 11, Con 11, Int 10, Wis 10, Cha 7
Base Atk +0; CMB -1; CMD 9
Feats Weapon Finesse
Treasure None`;

export const ValidatorPlayground: React.FC = () => {
  const [rawInput, setRawInput] = useState(SAMPLE_TEXT);
  const [parsedBlock, setParsedBlock] = useState<PF1eStatBlock | null>(null);
  const [fixMode, setFixMode] = useState<FixMode>('fix_math');
  const [fixedBlock, setFixedBlock] = useState<PF1eStatBlock | null>(null);
  const [fixLogs, setFixLogs] = useState<FixLogEntry[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

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

      const vBasics = validateBasics(parsed);
      const vBench = validateBenchmarks(parsed);
      const vEcon = validateEconomy(parsed);

      const combined: ValidationResult = {
        valid: vBasics.valid && vBench.valid && vEcon.valid,
        status: (vBasics.status === 'FAIL' || vEcon.status === 'FAIL') ? 'FAIL' 
              : (vBasics.status === 'WARN' || vEcon.status === 'WARN' || vBench.status === 'WARN') ? 'WARN' 
              : 'PASS',
        messages: [...vBasics.messages, ...vBench.messages, ...vEcon.messages]
      };
      setValidationResult(combined);

      // Execute Fixer
      const { block: fixed, fixes } = autoFixStatBlock(parsed, fixMode);
      setFixedBlock(fixed);
      setFixLogs(fixes);

    } catch (e) {
      console.error(e);
    }
  }, [rawInput, fixMode]);

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
            <h3 className="validator-header">2. Rules Lawyer Audit (v2)</h3>
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
            <div className="mode-toggle">
                <button
                    onClick={() => setFixMode('fix_math')}
                    className={`mode-btn ${fixMode === 'fix_math' ? 'active' : 'inactive'}`}
                    title="Trust Stats, Update CR"
                >
                    Fix Math
                </button>
                <button
                    onClick={() => setFixMode('enforce_cr')}
                    className={`mode-btn ${fixMode === 'enforce_cr' ? 'active' : 'inactive'}`}
                    title="Trust CR, Downgrade Stats"
                >
                    Enforce CR
                </button>
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
