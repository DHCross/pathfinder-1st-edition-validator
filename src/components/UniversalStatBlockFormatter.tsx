import React, { useState, useEffect, useCallback } from 'react';
import './UniversalStatBlockFormatter.css';
import { expandBlob, formatAffliction, formatStatBlock, cleanLine } from '../lib/universal-formatter-logic';

type Mode = 'npc' | 'monster' | 'affliction';

interface UniversalStatBlockFormatterProps {
  initialInput?: string;
}

const EXAMPLES = {
  npc: `Battle Mage CR 5
Human evoker 6
N Medium humanoid
Init +6; Senses Perception +6
AC 16, touch 12, flat-footed 14
hp 33 (6d6+12)
Fort +3, Ref +4, Will +5
Speed 30 ft.
Tactics: Before Combat casts mage armor.`,
  monster: `Mutant Feral Cat (x3) CR 1
XP 400
CN Small Magical Beast
Init +3; Senses Darkvision 60 ft., Low-light vision; Perception +5
DEFENSE
AC 15, touch 14, flat-footed 12 (+3 Dex, +1 natural, +1 size)
hp 13 (2d10+2)
Fort +4, Ref +6, Will +1
OFFENSE
Speed 40 ft., Climb 20 ft.
Melee 2 claws +6 (1d3-1), bite +6 (1d4-1)
Special Attacks Pounce, Rake (2 claws +6, 1d3-1)
STATISTICS
Str 8, Dex 17, Con 12, Int 6, Wis 12, Cha 10
Base Atk +2; CMB +0; CMD 13 (17 vs. trip)
Feats Weapon Finesse
Skills Acrobatics +11, Stealth +11
SPECIAL ABILITIES
Telepathy (Su): The cat can communicate telepathically with any creature within 100 ft. It cannot speak verbally.
Pack Mind (Ex): If adjacent to another Mutant Feral Cat, they gain a +1 morale bonus on Attack rolls.`,
  affliction: `Filth Fever (E. coli / Dysentery)
Type: disease, injury or ingested
Save: Fortitude DC 12
Onset: 1d3 days
Frequency: 1/day
Effect: 1d3 Con damage and 1d3 Dex damage.`
};

export const UniversalStatBlockFormatter: React.FC<UniversalStatBlockFormatterProps> = ({ initialInput = '' }) => {
  const [input, setInput] = useState(initialInput);
  const [mode, setMode] = useState<Mode>('npc');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const loadExample = useCallback(() => {
    setInput(EXAMPLES[mode]);
  }, [mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, [output]);

  const parseAndFormat = useCallback(() => {
      if (!input.trim()) {
          setOutput('');
          setErrors([]);
          return;
      }

      try {
          // Pre-process: Expand blobs
          const expandedText = expandBlob(input);
          const lines = expandedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

          let res = '';
          if (mode === 'affliction') {
              res = formatAffliction(lines);
          } else {
              res = formatStatBlock(lines, mode);
          }
          setOutput(res);
          setErrors([]);
      } catch (e) {
          console.error(e);
          setErrors(["Failed to parse. Outputting raw uppercase fallback."]);
          setOutput(input.toUpperCase());
      }
  }, [input, mode]);

  // Effect to trigger parsing when input/mode changes
  useEffect(() => {
      const timeoutId = setTimeout(() => {
          parseAndFormat();
      }, 300); // Debounce
      return () => clearTimeout(timeoutId);
  }, [parseAndFormat]);

  return (
    <div className="universal-formatter">
      <div className="formatter-header">
        <div className="header-content">
          <h2>Universal Stat Block Formatter</h2>
          <p>Clean and reformat text for Martin's Visual Audit (Universal Template)</p>
        </div>

        <div className="mode-toggle">
          <button
            onClick={() => setMode('npc')}
            className={`mode-btn ${mode === 'npc' ? 'active npc' : ''}`}
            title="NPC / Unique Antagonist"
          >
            👤 NPC
          </button>
          <button
            onClick={() => setMode('monster')}
            className={`mode-btn ${mode === 'monster' ? 'active monster' : ''}`}
            title="Generic Monster / Creature"
          >
            👹 Monster
          </button>
          <button
            onClick={() => setMode('affliction')}
            className={`mode-btn ${mode === 'affliction' ? 'active affliction' : ''}`}
            title="Disease / Curse / Poison"
          >
            🧪 Affliction
          </button>
        </div>
      </div>

      <div className="formatter-panels">
        {/* INPUT */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Raw Input</span>
            <div className="panel-actions">
              <button className="action-btn highlight-blue" onClick={loadExample}>
                Load {mode.charAt(0).toUpperCase() + mode.slice(1)} Example
              </button>
              <button className="action-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="editor-area"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste messy stat block here..."
          />
        </div>

        {/* OUTPUT */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Formatted Output (Markdown)</span>
            <div className="panel-actions">
              <button
                className={`btn-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : 'Copy Markdown'}
              </button>
            </div>
          </div>
          <textarea
            className="editor-area output-area"
            value={output}
            readOnly
          />
          {errors.length > 0 && (
             <div className="error-banner">
                <span>⚠️ {errors[0]}</span>
             </div>
          )}
        </div>
      </div>

      <div className="guidelines">
        <h3>Usage Guidelines:</h3>
        <ul>
          <li><strong>Manual Override:</strong> The parser respects specific values like <code className="highlight-green">hp 17</code> even if math suggests otherwise.</li>
          <li><strong>Section Headers:</strong> If your input is a single blob of text, the system tries to split it by detecting headers like <code className="highlight-blue">DEFENSE</code> or <code className="highlight-blue">OFFENSE</code>.</li>
          <li><strong>Martin-Safe:</strong> Headers are automatically converted to <strong>BOLD CAPS</strong>.</li>
        </ul>
      </div>
    </div>
  );
};

export default UniversalStatBlockFormatter;
