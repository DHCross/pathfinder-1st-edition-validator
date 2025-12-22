import React, { useState, useMemo, useCallback } from 'react';
import { parsePF1eStatBlock } from '../lib/pf1e-parser';
import { validateBasics } from '../engine/validateBasics';
import { validateBenchmarks } from '../engine/validateBenchmarks';
import { validateEconomy } from '../engine/validateEconomy';
import { validateSynergy } from '../engine/validateSynergy';
import { PF1eStatBlock, ValidationMessage } from '../types/PF1eStatBlock';
import './DocumentValidator.css';

interface ExtractedBlock {
  text: string;
  line: number;
  parsed: PF1eStatBlock;
  messages: ValidationMessage[];
  status: 'PASS' | 'WARN' | 'FAIL';
  excepted: boolean;
}

interface ExceptionOverride {
  line: number;
  type: 'overpowered' | 'trivial' | 'scenery' | 'plot-armor';
  reason: string;
}

/**
 * Extract stat blocks from markdown content.
 * Looks for lines starting with a creature name followed by "CR X".
 */
function extractStatBlocks(content: string): { text: string; line: number }[] {
  const blocks: { text: string; line: number }[] = [];
  const lines = content.split('\n');
  let currentBlock: string[] = [];
  let startLine = 0;
  let inBlock = false;

  // Matches: **Name CR 1**, *Name CR 1/2*, Name CR 3, etc.
  const startRegex = /^[*_]*([^\*_]+?)[*_]*\s+CR\s+([0-9\/]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (startRegex.test(line)) {
      if (inBlock && currentBlock.length > 0) {
        blocks.push({ text: currentBlock.join('\n'), line: startLine });
      }
      inBlock = true;
      startLine = i + 1;
      currentBlock = [line];
      continue;
    }

    if (inBlock) {
      if (line.startsWith('#')) {
        inBlock = false;
        blocks.push({ text: currentBlock.join('\n'), line: startLine });
        currentBlock = [];
      } else {
        currentBlock.push(line);
      }
    }
  }

  if (inBlock && currentBlock.length > 0) {
    blocks.push({ text: currentBlock.join('\n'), line: startLine });
  }

  return blocks;
}

export function DocumentValidator() {
  const [documentText, setDocumentText] = useState('');
  const [partyLevel, setPartyLevel] = useState<number | undefined>(undefined);
  const [adventureMinLevel, setAdventureMinLevel] = useState<number | undefined>(undefined);
  const [adventureMaxLevel, setAdventureMaxLevel] = useState<number | undefined>(undefined);
  const [exceptions, setExceptions] = useState<Map<number, ExceptionOverride>>(new Map());
  const [filterStatus, setFilterStatus] = useState<'all' | 'issues' | 'exceptions'>('all');
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  // Parse and validate all stat blocks
  const validatedBlocks = useMemo((): ExtractedBlock[] => {
    if (!documentText.trim()) return [];

    const rawBlocks = extractStatBlocks(documentText);
    
    return rawBlocks.map((raw) => {
      const parsed = parsePF1eStatBlock(raw.text);
      
      // Apply adventure context
      if (partyLevel !== undefined) {
        parsed.partyLevel = partyLevel;
      }
      if (adventureMinLevel !== undefined || adventureMaxLevel !== undefined) {
        parsed.adventureLevelRange = {
          min: adventureMinLevel ?? adventureMaxLevel ?? 1,
          max: adventureMaxLevel ?? adventureMinLevel ?? 20,
        };
      }

      // Apply any manual exceptions
      const override = exceptions.get(raw.line);
      if (override) {
        parsed.encounterException = true;
        parsed.encounterExceptionType = override.type;
        parsed.encounterExceptionReason = override.reason;
      }

      // Run validators
      const vBasics = validateBasics(parsed);
      const vBench = validateBenchmarks(parsed);
      const vEcon = validateEconomy(parsed);
      const vSynergy = validateSynergy(parsed);

      const allMessages = [
        ...vBasics.messages,
        ...vBench.messages,
        ...vEcon.messages,
        ...vSynergy.messages,
      ];

      const hasErrors = allMessages.some((m) => m.severity === 'critical');
      const hasWarnings = allMessages.some((m) => m.severity === 'warning');

      return {
        text: raw.text,
        line: raw.line,
        parsed,
        messages: allMessages,
        status: hasErrors ? 'FAIL' : hasWarnings ? 'WARN' : 'PASS',
        excepted: !!override || parsed.encounterException === true,
      };
    });
  }, [documentText, partyLevel, adventureMinLevel, adventureMaxLevel, exceptions]);

  // Summary stats
  const summary = useMemo(() => {
    const total = validatedBlocks.length;
    const pass = validatedBlocks.filter((b) => b.status === 'PASS').length;
    const warn = validatedBlocks.filter((b) => b.status === 'WARN').length;
    const fail = validatedBlocks.filter((b) => b.status === 'FAIL').length;
    const excepted = validatedBlocks.filter((b) => b.excepted).length;
    
    // Detect patterns
    const crValues = validatedBlocks.map((b) => {
      const cr = b.parsed.cr;
      return typeof cr === 'number' ? cr : parseFloat(String(cr)) || 0;
    });
    const minCR = crValues.length ? Math.min(...crValues) : 0;
    const maxCR = crValues.length ? Math.max(...crValues) : 0;

    return { total, pass, warn, fail, excepted, minCR, maxCR };
  }, [validatedBlocks]);

  // Filter blocks based on current filter
  const filteredBlocks = useMemo(() => {
    switch (filterStatus) {
      case 'issues':
        return validatedBlocks.filter((b) => b.status !== 'PASS');
      case 'exceptions':
        return validatedBlocks.filter((b) => b.excepted);
      default:
        return validatedBlocks;
    }
  }, [validatedBlocks, filterStatus]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDocumentText(content);
      setExceptions(new Map()); // Reset exceptions on new file
    };
    reader.readAsText(file);
  }, []);

  // Toggle exception for a block
  const toggleException = useCallback((line: number, type: ExceptionOverride['type'], reason: string) => {
    setExceptions((prev) => {
      const next = new Map(prev);
      if (next.has(line)) {
        next.delete(line);
      } else {
        next.set(line, { line, type, reason });
      }
      return next;
    });
  }, []);

  // Toggle expanded state
  const toggleExpanded = useCallback((line: number) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(line)) {
        next.delete(line);
      } else {
        next.add(line);
      }
      return next;
    });
  }, []);

  // Export exceptions as JSON
  const exportExceptions = useCallback(() => {
    const data = Array.from(exceptions.entries()).map(([lineNum, override]) => {
      const block = validatedBlocks.find((b) => b.line === lineNum);
      return {
        line: lineNum,
        name: block?.parsed.name || 'Unknown',
        cr: block?.parsed.cr,
        type: override.type,
        reason: override.reason,
      };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encounter-exceptions.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exceptions, validatedBlocks]);

  return (
    <div className="document-validator">
      <header className="dv-header">
        <h1>📄 Document Validator</h1>
        <p>Validate all stat blocks in a Markdown adventure document</p>
      </header>

      {/* Adventure Context Controls */}
      <section className="dv-context-panel">
        <h3>🎯 Adventure Context (Optional)</h3>
        <p className="hint">Set party level to auto-detect trivial/overpowered encounters</p>
        
        <div className="context-controls">
          <label>
            Party Level:
            <input
              type="number"
              min={1}
              max={20}
              value={partyLevel ?? ''}
              onChange={(e) => setPartyLevel(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 5"
            />
          </label>
          
          <span className="or-divider">— or —</span>
          
          <label>
            Level Range:
            <input
              type="number"
              min={1}
              max={20}
              value={adventureMinLevel ?? ''}
              onChange={(e) => setAdventureMinLevel(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Min"
              style={{ width: '60px' }}
            />
            <span> to </span>
            <input
              type="number"
              min={1}
              max={20}
              value={adventureMaxLevel ?? ''}
              onChange={(e) => setAdventureMaxLevel(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Max"
              style={{ width: '60px' }}
            />
          </label>
        </div>
      </section>

      {/* Input Section */}
      <section className="dv-input-section">
        <div className="input-header">
          <h3>📝 Document Input</h3>
          <label className="file-upload-btn">
            📂 Upload .md File
            <input type="file" accept=".md,.txt" onChange={handleFileUpload} hidden />
          </label>
        </div>
        
        <textarea
          className="dv-textarea"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder="Paste your Markdown adventure document here, or upload a file...

Example stat block format:

**Goblin Warrior CR 1/3**
XP 135
NE Small humanoid (goblinoid)
Init +6; Senses darkvision 60 ft.; Perception –1
DEFENSE
AC 16, touch 13, flat-footed 14 (+2 armor, +2 Dex, +1 shield, +1 size)
hp 6 (1d10+1)
Fort +3, Ref +2, Will –1
..."
          rows={10}
        />
      </section>

      {/* Summary Panel */}
      {validatedBlocks.length > 0 && (
        <section className="dv-summary">
          <h3>📊 Validation Summary</h3>
          <div className="summary-stats">
            <div className="stat total">
              <span className="stat-value">{summary.total}</span>
              <span className="stat-label">Stat Blocks</span>
            </div>
            <div className="stat pass">
              <span className="stat-value">{summary.pass}</span>
              <span className="stat-label">✅ Pass</span>
            </div>
            <div className="stat warn">
              <span className="stat-value">{summary.warn}</span>
              <span className="stat-label">⚠️ Warnings</span>
            </div>
            <div className="stat fail">
              <span className="stat-value">{summary.fail}</span>
              <span className="stat-label">❌ Errors</span>
            </div>
            <div className="stat excepted">
              <span className="stat-value">{summary.excepted}</span>
              <span className="stat-label">🏴 Excepted</span>
            </div>
          </div>
          
          <div className="cr-range">
            CR Range: <strong>{summary.minCR}</strong> to <strong>{summary.maxCR}</strong>
            {partyLevel !== undefined && (
              <span className="party-context"> (Party Level: {partyLevel})</span>
            )}
          </div>

          <div className="filter-controls">
            <button 
              className={filterStatus === 'all' ? 'active' : ''} 
              onClick={() => setFilterStatus('all')}
            >
              All ({validatedBlocks.length})
            </button>
            <button 
              className={filterStatus === 'issues' ? 'active' : ''} 
              onClick={() => setFilterStatus('issues')}
            >
              Issues Only ({summary.warn + summary.fail})
            </button>
            <button 
              className={filterStatus === 'exceptions' ? 'active' : ''} 
              onClick={() => setFilterStatus('exceptions')}
            >
              Exceptions ({summary.excepted})
            </button>
            
            {exceptions.size > 0 && (
              <button className="export-btn" onClick={exportExceptions}>
                📤 Export Exceptions
              </button>
            )}
          </div>
        </section>
      )}

      {/* Results List */}
      <section className="dv-results">
        {filteredBlocks.map((block) => {
          const isExpanded = expandedBlocks.has(block.line);
          const crValue = typeof block.parsed.cr === 'number' 
            ? block.parsed.cr 
            : parseFloat(String(block.parsed.cr)) || 0;
          
          // Check if this might be an exception candidate
          const crDelta = partyLevel !== undefined ? crValue - partyLevel : 0;
          const isOverpoweredCandidate = crDelta >= 5;
          const isTrivialCandidate = crDelta <= -4;
          const isExceptionCandidate = (isOverpoweredCandidate || isTrivialCandidate) && !block.excepted;

          return (
            <div 
              key={block.line} 
              className={`result-card status-${block.status.toLowerCase()} ${block.excepted ? 'excepted' : ''}`}
            >
              <div className="result-header" onClick={() => toggleExpanded(block.line)}>
                <span className="status-icon">
                  {block.excepted ? '🏴' : block.status === 'PASS' ? '✅' : block.status === 'WARN' ? '⚠️' : '❌'}
                </span>
                <span className="creature-name">{block.parsed.name || 'Unknown'}</span>
                <span className="creature-cr">CR {block.parsed.cr}</span>
                <span className="line-number">Line {block.line}</span>
                <span className="message-count">
                  {block.messages.length} message{block.messages.length !== 1 ? 's' : ''}
                </span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {/* Exception suggestion banner */}
              {isExceptionCandidate && (
                <div className={`exception-suggestion ${isOverpoweredCandidate ? 'overpowered' : 'trivial'}`}>
                  {isOverpoweredCandidate ? (
                    <>
                      🐉 <strong>Overpowered?</strong> CR {block.parsed.cr} is far above party level {partyLevel}.
                      <button onClick={() => toggleException(
                        block.line, 
                        'overpowered', 
                        `CR ${block.parsed.cr} creature in level ${partyLevel} adventure - flee or die scenario`
                      )}>
                        Flag as Exception
                      </button>
                    </>
                  ) : (
                    <>
                      🛡️ <strong>Trivial?</strong> CR {block.parsed.cr} is far below party level {partyLevel}.
                      <button onClick={() => toggleException(
                        block.line, 
                        'trivial', 
                        `CR ${block.parsed.cr} NPC in level ${partyLevel} adventure - world-building, not combat threat`
                      )}>
                        Flag as Exception
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Already excepted banner */}
              {block.excepted && (
                <div className="excepted-banner">
                  🏴 <strong>EXCEPTED:</strong> {block.parsed.encounterExceptionReason || 'Marked as non-combat encounter'}
                  <button onClick={() => {
                    const override = exceptions.get(block.line);
                    if (override) toggleException(block.line, override.type, override.reason);
                  }}>
                    Remove Exception
                  </button>
                </div>
              )}

              {isExpanded && (
                <div className="result-details">
                  <div className="messages-list">
                    {block.messages.length === 0 ? (
                      <p className="no-messages">✨ No issues found</p>
                    ) : (
                      block.messages.map((msg, idx) => (
                        <div key={idx} className={`message severity-${msg.severity}`}>
                          <span className="severity-badge">
                            {msg.severity === 'critical' ? '🔴' : msg.severity === 'warning' ? '🟡' : '⚪'}
                          </span>
                          <span className="category">[{msg.category}]</span>
                          <span className="message-text">{msg.message}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick exception controls */}
                  {!block.excepted && (
                    <div className="quick-exception-controls">
                      <span>Mark as exception:</span>
                      <button onClick={() => toggleException(block.line, 'trivial', 'World-building NPC - trivial threat')}>
                        🛡️ Trivial
                      </button>
                      <button onClick={() => toggleException(block.line, 'overpowered', 'Flee or die scenario')}>
                        🐉 Overpowered
                      </button>
                      <button onClick={() => toggleException(block.line, 'scenery', 'Background creature - not meant for combat')}>
                        🎭 Scenery
                      </button>
                      <button onClick={() => toggleException(block.line, 'plot-armor', 'Plot-protected NPC')}>
                        📜 Plot Armor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default DocumentValidator;
