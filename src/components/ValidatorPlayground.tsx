import React, { useState } from 'react';
import { parsePF1eStatBlock } from '../lib/pf1e-parser';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { autoFixStatBlock, FixLogEntry } from '../engine/autoFixer';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { ValidationResult } from '../types/PF1eStatBlock';

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
  const [fixedBlock, setFixedBlock] = useState(() => autoFixStatBlock(parsePF1eStatBlock(SAMPLE_TEXT)).block);
  const [fixes, setFixes] = useState<FixLogEntry[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.currentTarget.value;
    setRawInput(newText);
    
    try {
      const parsed = parsePF1eStatBlock(newText);
      
      const { block: fixed, fixes: newFixes } = autoFixStatBlock(parsed);
      setFixedBlock(fixed);
      setFixes(newFixes);
      
      // Run validators
      const basicsResult = validateBasics(parsed);
      const benchmarksResult = validateBenchmarks(parsed);
      setValidationResults([basicsResult, benchmarksResult]);
    } catch (error) {
      console.error('Parse error:', error);
    }
  };

  const getStatusColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error': return '#dc2626';
      case 'warning': return '#ea580c';
      case 'info': return '#2563eb';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '1rem',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Column 1: Raw Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          📝 Raw Stat Block
        </h2>
        <textarea
          value={rawInput}
          onChange={handleInputChange}
          style={{
            flex: 1,
            padding: '0.75rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            resize: 'none',
            lineHeight: 1.5
          }}
          spellCheck={false}
        />
      </div>

      {/* Column 2: Validation Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'auto' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          ⚖️ Validation & Fixes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {validationResults.map((result, idx) => (
            <div key={idx} style={{
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                {result.messages[0]?.category || 'Validation'}
              </div>
              {result.messages.length === 0 ? (
                <div style={{ color: '#059669', fontWeight: 500 }}>✓ PASS</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {result.messages.map((msg, msgIdx) => (
                    <li key={msgIdx} style={{ 
                      color: getStatusColor(msg.severity),
                      marginBottom: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      <strong>{msg.severity.toUpperCase()}:</strong> {msg.message}
                      {msg.expected !== undefined && (
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#6b7280' }}>
                          Expected: {JSON.stringify(msg.expected)} | Actual: {JSON.stringify(msg.actual)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Auto-Fixes Section */}
          {fixes.length > 0 && (
            <div style={{
              border: '1px solid #10b981',
              borderRadius: '0.375rem',
              padding: '0.75rem',
              backgroundColor: '#f0fdf4'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#059669' }}>
                🛠️ Auto-Fixes Applied
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {fixes.map((fix, idx) => (
                  <li key={idx} style={{ 
                    color: '#047857',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <strong>{fix.feature}:</strong> {fix.oldValue} → <strong>{fix.newValue}</strong>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.1rem', color: '#065f46' }}>
                      {fix.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Fixed Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          ✨ Auto-Fixed Version
        </h2>
        <textarea
          value={formatPF1eStatBlock(fixedBlock)}
          readOnly
          style={{
            flex: 1,
            padding: '0.75rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            border: '1px solid #10b981',
            borderRadius: '0.375rem',
            resize: 'none',
            backgroundColor: '#f0fdf4',
            lineHeight: 1.5
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
