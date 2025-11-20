import React, { useState, useEffect } from 'react';
import { parsePF1eStatBlock } from '../lib/pf1e-parser';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { autoFixStatBlock, FixMode, FixLogEntry } from '../engine/autoFixer';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { ValidatorDisplay } from './ValidatorDisplay';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      {/* COLUMN 1: RAW INPUT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#374151', margin: 0 }}>1. Raw Stat Block</h2>
        <textarea
          style={{ flex: 1, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', resize: 'none', outline: 'none' }}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste stat block here..."
        />
      </div>

      {/* COLUMN 2: AUDIT & LOGS */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem', color: '#374151', margin: 0 }}>2. Rules Lawyer Audit</h3>
            {parsedBlock && validationResult ? (
            <ValidatorDisplay statBlock={parsedBlock} validation={validationResult} />
            ) : null}
        </div>

        {/* NEW: FIX REPORT */}
        {fixLogs.length > 0 && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    🛠️ Auto-Fixes Applied ({fixMode === 'fix_math' ? 'Audit Mode' : 'Design Mode'})
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {fixLogs.map((fix, i) => (
                        <li key={i} style={{ fontSize: '0.75rem', color: '#1e3a8a' }}>
                            <div style={{ fontWeight: 600 }}>{fix.feature}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                                <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{fix.oldValue}</span>
                                <span>→</span>
                                <span style={{ fontWeight: 'bold', backgroundColor: 'white', padding: '0 0.25rem', borderRadius: '0.25rem', border: '1px solid #dbeafe' }}>{fix.newValue}</span>
                            </div>
                            <div style={{ color: '#3b82f6', fontStyle: 'italic', marginTop: '0.125rem' }}>{fix.reason}</div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {/* COLUMN 3: FIX OUTPUT (With Toggle) */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#374151', margin: 0 }}>3. Auto-Fixed Version</h2>
            
            {/* MODE TOGGLE */}
            <div style={{ display: 'flex', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', padding: '0.25rem' }}>
                <button
                    onClick={() => setFixMode('fix_math')}
                    style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: fixMode === 'fix_math' ? 'white' : 'transparent',
                        color: fixMode === 'fix_math' ? '#1d4ed8' : '#4b5563',
                        fontWeight: fixMode === 'fix_math' ? 'bold' : 'normal',
                        boxShadow: fixMode === 'fix_math' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                    title="Trust Stats, Update CR"
                >
                    Fix Math
                </button>
                <button
                    onClick={() => setFixMode('enforce_cr')}
                    style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: fixMode === 'enforce_cr' ? 'white' : 'transparent',
                        color: fixMode === 'enforce_cr' ? '#1d4ed8' : '#4b5563',
                        fontWeight: fixMode === 'enforce_cr' ? 'bold' : 'normal',
                        boxShadow: fixMode === 'enforce_cr' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                    title="Trust CR, Downgrade Stats"
                >
                    Enforce CR
                </button>
            </div>
         </div>
         
         <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.25rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '1rem', overflowY: 'auto', marginTop: '0.5rem' }}>
            {fixedBlock ? (
                <pre style={{ fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#1f2937', margin: 0 }}>
                    {formatPF1eStatBlock(fixedBlock)}
                </pre>
            ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Fixes will appear here.</p>
            )}
        </div>
        
        <button 
            onClick={() => fixedBlock && navigator.clipboard.writeText(formatPF1eStatBlock(fixedBlock))}
            style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '0.25rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: 'pointer'
            }}
        >
            📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
};
