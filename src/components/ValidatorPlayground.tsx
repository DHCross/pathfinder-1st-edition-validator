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
    <div className="grid grid-cols-3 gap-4 p-4 h-screen bg-gray-50 font-sans">
      {/* COLUMN 1: RAW INPUT */}
      <div className="flex flex-col gap-2 h-full">
        <h2 className="font-bold text-lg text-gray-700">1. Raw Stat Block</h2>
        <textarea
          className="flex-1 p-3 font-mono text-sm border border-gray-300 rounded shadow-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste stat block here..."
        />
      </div>

      {/* COLUMN 2: AUDIT & LOGS */}
      <div className="overflow-y-auto flex flex-col gap-4">
        <div>
            <h3 className="font-bold text-lg mb-2 text-gray-700">2. Rules Lawyer Audit</h3>
            {parsedBlock && validationResult ? (
            <ValidatorDisplay statBlock={parsedBlock} validation={validationResult} />
            ) : null}
        </div>

        {/* NEW: FIX REPORT */}
        {fixLogs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2 text-sm flex items-center gap-2">
                    🛠️ Auto-Fixes Applied ({fixMode === 'fix_math' ? 'Audit Mode' : 'Design Mode'})
                </h4>
                <ul className="space-y-2">
                    {fixLogs.map((fix, i) => (
                        <li key={i} className="text-xs text-blue-900">
                            <div className="font-semibold">{fix.feature}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="line-through opacity-60">{fix.oldValue}</span>
                                <span>→</span>
                                <span className="font-bold bg-white px-1 rounded border border-blue-100">{fix.newValue}</span>
                            </div>
                            <div className="text-blue-500 italic mt-0.5">{fix.reason}</div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {/* COLUMN 3: FIX OUTPUT (With Toggle) */}
      <div className="flex flex-col h-full">
         <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg text-gray-700">3. Auto-Fixed Version</h2>
            
            {/* MODE TOGGLE */}
            <div className="flex bg-gray-200 rounded p-1">
                <button
                    onClick={() => setFixMode('fix_math')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                        fixMode === 'fix_math' 
                        ? 'bg-white text-blue-700 font-bold shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Trust Stats, Update CR"
                >
                    Fix Math
                </button>
                <button
                    onClick={() => setFixMode('enforce_cr')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                        fixMode === 'enforce_cr' 
                        ? 'bg-white text-blue-700 font-bold shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Trust CR, Downgrade Stats"
                >
                    Enforce CR
                </button>
            </div>
         </div>
         
         <div className="flex-1 bg-white border rounded shadow-sm p-4 overflow-y-auto mt-2">
            {fixedBlock ? (
                <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800">
                    {formatPF1eStatBlock(fixedBlock)}
                </pre>
            ) : (
                <p className="text-gray-400 text-sm italic">Fixes will appear here.</p>
            )}
        </div>
        
        <button 
            onClick={() => fixedBlock && navigator.clipboard.writeText(formatPF1eStatBlock(fixedBlock))}
            className="mt-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-2"
        >
            📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
};
