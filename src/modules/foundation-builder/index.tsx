import React, { useState } from 'react';

export type HdGuardrailInfo = {
  estimate?: number | null;
  max?: number | null;
  hpBenchmark?: number | null;
  totalHD?: number;
  canonicalXP?: number | null;
};

export type FoundationProps = {
  name: string;
  targetCR: number;
  creatureType: string;
  hd: number;
  hdDie?: 'd6'|'d8'|'d10'|'d12';
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  buildPath: 'Monster' | 'NPC' | 'From-Scratch';
  size: 'Tiny'|'Small'|'Medium'|'Large'|'Huge'|'Gargantuan';
  template?: string | null;
  onTemplateChange?: (next: string | null) => void;
  onApplyTemplate?: (name: string) => void;
  onSizeChange?: (size: FoundationProps['size']) => void;
  onNameChange: (next: string) => void;
  onTargetCRChange: (next: number) => void;
  onCreatureTypeChange: (next: string) => void;
  onHdChange: (next: number) => void;
  onHdDieChange?: (next: FoundationProps['hdDie']) => void;
  onStrChange: (next: number) => void;
  onDexChange: (next: number) => void;
  onConChange: (next: number) => void;
  onIntChange: (next: number) => void;
  onWisChange: (next: number) => void;
  onChaChange: (next: number) => void;
  onBuildPathChange: (next: FoundationProps['buildPath']) => void;
  onLoadPreset?: (preset: 'NastyBeast' | 'LowestScores') => void;
  hdGuardrail?: HdGuardrailInfo;
};

const PATHS: Array<FoundationProps['buildPath']> = ['Monster', 'NPC', 'From-Scratch'];

export const FoundationBuilder: React.FC<FoundationProps> = ({
  name,
  targetCR,
  creatureType,
  hd,
  hdDie,
  str,
  dex,
  con,
  int,
  wis,
  cha,
  buildPath,
  onNameChange,
  onTargetCRChange,
  onCreatureTypeChange,
  onHdChange,
  onStrChange,
  onDexChange,
  onConChange,
  onIntChange,
  onWisChange,
  onChaChange,
  onBuildPathChange,
  onLoadPreset,
  size,
  template,
  onTemplateChange,
  onApplyTemplate,
  onSizeChange,
  onHdDieChange,
  hdGuardrail,
}) => {
  const [autoAdjustPhysical, setAutoAdjustPhysical] = useState(false);
  const guardrailEstimate = typeof hdGuardrail?.estimate === 'number' ? hdGuardrail.estimate : undefined;
  const guardrailMax = typeof hdGuardrail?.max === 'number' ? hdGuardrail.max : undefined;
  const guardrailHpBenchmark =
    typeof hdGuardrail?.hpBenchmark === 'number' ? hdGuardrail.hpBenchmark : undefined;
  const guardrailTotalHD = typeof hdGuardrail?.totalHD === 'number' ? hdGuardrail.totalHD : hd;
  const guardrailXP = typeof hdGuardrail?.canonicalXP === 'number' ? hdGuardrail.canonicalXP : undefined;

  const sizeBaseScores: Record<string, { str: number; dex: number; con: number }> = {
    Medium: { str: 10, dex: 10, con: 10 },
    Large: { str: 18, dex: 8, con: 14 },
    Huge: { str: 26, dex: 6, con: 18 },
    Gargantuan: { str: 34, dex: 6, con: 22 },
    Colossal: { str: 42, dex: 6, con: 26 },
  };
  return (
    <section
      aria-labelledby="foundation-card-title"
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 20,
        boxShadow: 'inset 0 1px 0 #fff, 0 10px 30px #0f172a0d',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <h2 id="foundation-card-title" style={{ margin: '0 0 4px' }}>New Creature — Foundation</h2>
          <p style={{ margin: 0, color: '#475569' }}>Choose your build path, set CR, HD, ability scores, and give the creature a name.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#312e81', textTransform: 'uppercase', letterSpacing: 0.6 }}>Start here</span>
          {onLoadPreset && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onLoadPreset('NastyBeast')}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #9f7aea',
                  background: '#faf5ff',
                  color: '#6b21a8',
                  cursor: 'pointer',
                }}
              >
                Load: NastyBeast
              </button>
              <button
                onClick={() => onLoadPreset('LowestScores')}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #10b981',
                  background: '#ecfdf5',
                  color: '#065f46',
                  cursor: 'pointer',
                }}
              >
                Load: Lowest Scores
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Creature Type</div>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 4 }}>🔧 Foundational Rules Package</div>
            <div style={{ fontSize: 12, color: '#16a34a', lineHeight: 1.5 }}>
              Your creature type dictates HD size, BAB progression, save bonuses, skill economy, and inherent traits. This choice is the structural skeleton of your monster.
            </div>
          </div>
          <select
            value={creatureType}
            onChange={e => onCreatureTypeChange(e.target.value)}
            style={{
              border: '1px solid #cbd5f5',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 15,
              width: '100%',
              boxShadow: '0 2px 8px #1e3a8a18',
            }}
          >
            <option value="Humanoid">Humanoid (d8, Medium BAB, Int-based skills)</option>
            <option value="Animal">Animal (d8, Medium BAB, low-light vision, scent)</option>
            <option value="Construct">Construct (d10, Fast BAB, immune to mind-affecting)</option>
            <option value="Dragon">Dragon (d12, Fast BAB, all good saves, high skills)</option>
            <option value="Fey">Fey (d6, Slow BAB, high skills, forest-aligned)</option>
            <option value="Magical Beast">Magical Beast (d10, Fast BAB, darkvision)</option>
            <option value="Monstrous Humanoid">Monstrous Humanoid (d10, Fast BAB, darkvision)</option>
            <option value="Aberration">Aberration (d8, Medium BAB, will-focused, bizarre)</option>
            <option value="Outsider">Outsider (d10, Fast BAB, any saves, planar origin)</option>
            <option value="Undead">Undead (d8, Medium BAB, will-focused, immune to critical hits)</option>
            <option value="Ooze">Ooze (d8, Medium BAB, mindless, immune to precision damage)</option>
            <option value="Plant">Plant (d8, Medium BAB, fort-focused, immune to mental effects)</option>
            <option value="Vermin">Vermin (d8, Medium BAB, mindless, immune to mental effects)</option>
          </select>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
              Size
              <select value={size} onChange={e => {
                const newSize = e.target.value as FoundationProps['size'];
                console.debug('[FoundationBuilder] size change ->', { newSize, autoAdjustPhysical });
                if (onSizeChange) onSizeChange(newSize);
                if (autoAdjustPhysical && sizeBaseScores[newSize]) {
                  console.debug('[FoundationBuilder] applying size defaults', sizeBaseScores[newSize]);
                  onStrChange(sizeBaseScores[newSize].str);
                  onDexChange(sizeBaseScores[newSize].dex);
                  onConChange(sizeBaseScores[newSize].con);
                }
              }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <option value="Tiny">Tiny</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Huge">Huge</option>
                <option value="Gargantuan">Gargantuan</option>
              </select>
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
              <input type="checkbox" checked={autoAdjustPhysical} onChange={e => setAutoAdjustPhysical(e.target.checked)} />
              Auto-adjust physical scores to size defaults
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
              Template
              <select value={template || ''} onChange={e => onTemplateChange && onTemplateChange(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <option value="">None</option>
                <option value="Advanced Creature">Advanced Creature</option>
                <option value="Giant Creature">Giant Creature</option>
                <option value="Young Creature">Young Creature</option>
                <option value="Celestial Creature">Celestial Creature</option>
                <option value="Fiendish Creature">Fiendish Creature</option>
                <option value="Skeleton">Skeleton</option>
                <option value="Zombie">Zombie</option>
                <option value="Half-Dragon">Half-Dragon</option>
                <option value="Half-Fiend">Half-Fiend</option>
                <option value="Lich">Lich</option>
                <option value="Ghost">Ghost</option>
              </select>
            </label>
            {onApplyTemplate && (
              <button type="button" onClick={() => onApplyTemplate(template || 'None')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #9f7aea', background: '#faf5ff', color: '#6b21a8', cursor: 'pointer', fontWeight: 700 }}>Apply Template</button>
            )}
          </div>
        </div>

        <label style={{ fontWeight: 700, display: 'grid', gap: 8 }}>
          Creature Name
          <div style={{ position: 'relative' }}>
            <input
              value={name}
              onChange={e => onNameChange(e.target.value)}
              placeholder="e.g., Embermaw Basilisk"
              style={{
                border: '1px solid #cbd5f5',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 15,
                width: '100%',
                maxWidth: 640,
                boxShadow: '0 2px 8px #1e3a8a18',
              }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>Required</span>
          </div>
        </label>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Build Path</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {PATHS.map(path => {
              const active = buildPath === path;
              const description =
                path === 'Monster'
                  ? 'Classic foes with bestiary math'
                  : path === 'NPC'
                    ? 'Humanoid + gear presets'
                    : 'Blank canvas for homebrew';
              return (
                <button
                  key={path}
                  onClick={() => onBuildPathChange(path)}
                  type="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    borderRadius: 14,
                    padding: '12px 14px',
                    border: active ? '2px solid #4338ca' : '1px solid #cbd5f5',
                    background: active ? '#eef2ff' : '#fff',
                    color: active ? '#1e1b4b' : '#0f172a',
                    fontWeight: 600,
                    cursor: 'pointer',
                    gap: 4,
                    boxShadow: active ? '0 6px 16px #312e811c' : '0 2px 6px #0f172a0d',
                  }}
                >
                  <span>{path}</span>
                  <span style={{ fontSize: 13, color: active ? '#4c1d95' : '#475569', fontWeight: 500 }}>{description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Creature Type Details</div>
          <div style={{ background: '#f5f5ff', border: '1px solid #e0e7ff', borderRadius: 10, padding: 12, display: 'grid', gap: 8, fontSize: 13, color: '#312e81' }}>
            <div><strong>HD:</strong> {creatureType === 'Dragon' ? 'd12' : creatureType === 'Fey' ? 'd6' : (creatureType === 'Construct' || creatureType === 'Magical Beast' || creatureType === 'Monstrous Humanoid' || creatureType === 'Outsider') ? 'd10' : 'd8'}</div>
            <div><strong>BAB Progression:</strong> {creatureType === 'Fey' ? 'Slow (½ HD)' : (creatureType === 'Construct' || creatureType === 'Dragon' || creatureType === 'Magical Beast' || creatureType === 'Monstrous Humanoid' || creatureType === 'Outsider') ? 'Fast (Full HD)' : 'Medium (¾ HD)'}</div>
            <div><strong>Good Saves:</strong> {creatureType === 'Dragon' ? 'Fort, Ref, Will' : creatureType === 'Humanoid' ? 'Any one' : creatureType === 'Animal' ? 'Fort, Ref' : creatureType === 'Undead' ? 'Will' : creatureType === 'Plant' ? 'Fort' : creatureType === 'Vermin' ? 'Fort' : creatureType === 'Aberration' ? 'Will' : creatureType === 'Fey' ? 'Ref, Will' : creatureType === 'Monstrous Humanoid' ? 'Ref, Will' : 'Varies'}</div>
            <div><strong>Skill Ranks/HD:</strong> {creatureType === 'Dragon' || creatureType === 'Outsider' || creatureType === 'Fey' ? '6 + Int' : creatureType === 'Aberration' || creatureType === 'Undead' ? '4 + Int' : creatureType === 'Monstrous Humanoid' ? '4 + Int' : '2 + Int'}</div>
          </div>
          {creatureType === 'Humanoid' && (
            <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>
              <strong>Note:</strong> Humanoids commonly use class levels rather than Racial HD for progression. Use NPC classes to represent Humanoid threats at low CR (e.g., CR 1/3 Foot Soldier = 1 level fighter).
            </div>
          )}
          <div style={{ fontWeight: 700 }}>Target CR</div>
          <span style={{ fontSize: 13, color: '#475569' }}>CR {targetCR}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>1</span>
            <input
              type="range"
              min={1}
              max={25}
              value={targetCR}
              onChange={e => onTargetCRChange(parseInt(e.target.value, 10))}
              style={{ flexGrow: 1 }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>25</span>
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Calibrates HP, saves, attack bonuses, and loot tiers. Adjust to match your table’s target difficulty.
          </div>
          {hdGuardrail && (
            <div style={{ border: '1px solid #c7d2fe', background: '#eef2ff', borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 700, color: '#312e81' }}>HD / CR Guardrail</div>
              <div style={{ fontSize: 13, color: '#312e81' }}>
                CR {targetCR} benchmarks ~{guardrailEstimate ?? '—'} HD ({guardrailHpBenchmark ?? '—'} hp). Current build uses {guardrailTotalHD} HD.
              </div>
              {guardrailMax !== undefined && guardrailTotalHD > guardrailMax && (
                <div style={{ color: '#b45309', fontSize: 13 }}>
                  Warning: exceeding {guardrailMax} HD will trigger Rules Lawyer critical errors.
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {typeof guardrailEstimate === 'number' && (
                  <button
                    type="button"
                    onClick={() => onHdChange(Math.max(1, guardrailEstimate))}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #a5b4fc', background: '#fff', color: '#4338ca', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Set HD to {guardrailEstimate}
                  </button>
                )}
                {typeof guardrailXP === 'number' && (
                  <span style={{ padding: '6px 12px', borderRadius: 999, background: '#312e81', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                    XP locked: {guardrailXP}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Hit Dice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
            <div>
              <input
                type="number"
                min={1}
                max={20}
                value={hd}
                onChange={e => onHdChange(Number(e.target.value))}
                style={{
                  border: '1px solid #cbd5f5',
                  borderRadius: 12,
                  padding: '12px 14px',
                  fontSize: 15,
                  width: '100%',
                  boxShadow: '0 2px 8px #1e3a8a18',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                {/** show effective die; allow override via optional control passed from parent */}
                {hdDie || (creatureType === 'Dragon' ? 'd12' : creatureType === 'Fey' ? 'd6' : (creatureType === 'Construct' || creatureType === 'Magical Beast' || creatureType === 'Monstrous Humanoid' || creatureType === 'Outsider') ? 'd10' : 'd8')}
              </div>
              {onHdDieChange && (
                <select value={hdDie || ''} onChange={e => onHdDieChange(e.target.value as FoundationProps['hdDie'])} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <option value="">(auto)</option>
                  <option value="d6">d6</option>
                  <option value="d8">d8</option>
                  <option value="d10">d10</option>
                  <option value="d12">d12</option>
                </select>
              )}
            </div>
          </div>
          <details style={{ background: '#fff', border: '1px solid #e6edf3', borderRadius: 10, padding: 12, fontSize: 13, color: '#0f172a' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>Size Dictates Base Physical Scores</summary>
            <div style={{ lineHeight: 1.5 }}>
              <p><strong>Size is the primary physical adjuster for monsters built using Racial Hit Dice (RHD).</strong> The creation process dictates that Step 4 (Size) sets this baseline, and the creature’s physical ability scores should be "relatively close to the base values presented on Table: Size".</p>
              <p>Here is how Size acts as the primary physical adjuster:</p>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontWeight: 700 }}>Size Dictates Base Physical Scores</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th style={{ padding: '4px 6px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Size</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Minimum CR</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Base Str</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Base Dex</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Base Con</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>Medium</td>
                      <td style={{ padding: '4px 6px' }}>—</td>
                      <td style={{ padding: '4px 6px' }}>10</td>
                      <td style={{ padding: '4px 6px' }}>10</td>
                      <td style={{ padding: '4px 6px' }}>10</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>Large</td>
                      <td style={{ padding: '4px 6px' }}>2</td>
                      <td style={{ padding: '4px 6px' }}>18</td>
                      <td style={{ padding: '4px 6px' }}>8</td>
                      <td style={{ padding: '4px 6px' }}>14</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>Huge</td>
                      <td style={{ padding: '4px 6px' }}>4</td>
                      <td style={{ padding: '4px 6px' }}>26</td>
                      <td style={{ padding: '4px 6px' }}>6</td>
                      <td style={{ padding: '4px 6px' }}>18</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>Gargantuan</td>
                      <td style={{ padding: '4px 6px' }}>6</td>
                      <td style={{ padding: '4px 6px' }}>34</td>
                      <td style={{ padding: '4px 6px' }}>6</td>
                      <td style={{ padding: '4px 6px' }}>22</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>Colossal</td>
                      <td style={{ padding: '4px 6px' }}>8</td>
                      <td style={{ padding: '4px 6px' }}>42</td>
                      <td style={{ padding: '4px 6px' }}>6</td>
                      <td style={{ padding: '4px 6px' }}>26</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>As shown in the guidelines, <strong>Medium creatures</strong> serve as the baseline, starting all three physical scores at <strong>10</strong>. However, once a creature's size increases to <strong>Large or greater</strong>, it gains significant default bonuses to Strength and Constitution, while also incurring penalties to Dexterity, reflecting its bulk.</p>
              <p>These large default scores guarantee that creatures designed to be large (like the Huge Behir or Large Ogre) naturally meet the durability and damage output requirements for their minimum CR.</p>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Physical Scores vs. Mental Scores</div>
              <p>The principle of Size adjusting physical scores does not apply to mental scores:</p>
              <ul>
                <li><strong>Physical Scores (STR, DEX, CON):</strong> Must remain "relatively close" to the values set by the creature's size, unless the monster has a high average HP for its CR (requiring high CON).</li>
                <li><strong>Mental Scores (INT, WIS, CHA):</strong> The baseline for all mental abilities is <strong>10</strong>. These scores are largely defined by the creature’s <strong>concept</strong>—for instance, a creature relying on spells or spell-like abilities usually needs one mental ability score, such as Charisma, to "stand out".</li>
              </ul>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Size Adjustments in Practice</div>
              <p>The effect of size is profound and immediate, often outweighing other modifiers:</p>
              <ul>
                <li><strong>Ability Score Changes via Spells:</strong> Many spells and magical effects that change a creature's size apply fixed size bonuses and penalties to physical scores. For instance, the <em>Giant Form I</em> spell grants a <strong>+6 size bonus to Strength, a +4 size bonus to Constitution, and a –2 penalty to Dexterity</strong> to a creature becoming Large. Similarly, the <em>Animal Growth</em> spell increases a target animal's size by one category, granting a <strong>+8 size bonus to Strength</strong> and a <strong>+4 size bonus to Constitution</strong> (and thus an extra 2 hit points per HD), and imposing a <strong>–2 size penalty to Dexterity</strong>.</li>
                <li><strong>Advancing Creatures:</strong> When using the method of <strong>Advancing Racial Hit Dice</strong>, if a creature increases in size, its ability scores are modified according to the size change rules (Table 2–2), which follow the same large fixed increases to Strength and Constitution (e.g., Medium to Large grants <strong>+8 Str, –2 Dex, +4 Con</strong>).</li>
                <li><strong>Natural Attacks:</strong> Size also sets the baseline <strong>damage dice</strong> for a creature's natural attacks (like bite or slam). A bite attack from a Small creature deals 1d4 damage, while a bite from a Large creature deals 1d8 damage, and a Colossal creature deals 4d6 damage.</li>
              </ul>
              <p>In contrast, the creature <strong>type</strong> (e.g., Humanoid, Magical Beast) dictates the <em>progression rate</em> (Medium vs. Fast BAB) and the <em>type</em> of Hit Die (d8 vs. d10), but does not itself provide the massive starting adjustments to the raw Strength, Dexterity, and Constitution scores that size provides.</p>
              <p>If you'd like the builder to <em>auto-adjust</em> physical ability scores when Size changes (e.g., Large → set Str/Dex/Con to Large defaults), I can implement that as an optional behavior.</p>
            </div>
          </details>
          <details style={{ background: '#fff', border: '1px solid #e6edf3', borderRadius: 10, padding: 12, fontSize: 13, color: '#0f172a' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>CR & HD Basics (min die size and CR 1/2)</summary>
            <div style={{ lineHeight: 1.5 }}>
              <p><strong>Minimum Hit Die size for monsters is d6.</strong> Monsters don't typically use a d4 as their HD die; d4 is generally reserved for weapon or natural attack damage on small creatures.</p>
              <p><strong>CR 1/2 and lower exist:</strong> The builder supports fractional CRs (e.g., 1/8, 1/6, 1/4, 1/3, 1/2). These represent very small or weak threats.</p>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontWeight: 700 }}>Common Benchmarks</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th style={{ padding: '4px 6px', fontWeight: 700 }}>CR</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700 }}>Target HP</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700 }}>Target AC</th>
                      <th style={{ padding: '4px 6px', fontWeight: 700 }}>XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>1/2</td>
                      <td style={{ padding: '4px 6px' }}>~10</td>
                      <td style={{ padding: '4px 6px' }}>~11</td>
                      <td style={{ padding: '4px 6px' }}>200</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>1</td>
                      <td style={{ padding: '4px 6px' }}>~15</td>
                      <td style={{ padding: '4px 6px' }}>~12</td>
                      <td style={{ padding: '4px 6px' }}>400</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px' }}>1/3</td>
                      <td style={{ padding: '4px 6px' }}>~9</td>
                      <td style={{ padding: '4px 6px' }}>~10</td>
                      <td style={{ padding: '4px 6px' }}>135</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 8 }}><strong>Practical tip:</strong> If you're building a very low-CR opponent, aim for 1 HD and use templates or class levels for humanoids/NPCs rather than making racial HD d4.</p>
            </div>
          </details>
          <details style={{ background: '#fff', border: '1px solid #e6edf3', borderRadius: 10, padding: 12, fontSize: 13, color: '#0f172a' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>Templates: Categories & Quick Overview</summary>
            <div style={{ lineHeight: 1.5 }}>
              <p><strong>Templates</strong> are rule overlays applied to an existing creature to create a variant with modified statistics and abilities. Templates are commonly <em>Simple</em>, <em>Inherited</em>, or <em>Acquired</em>, affecting CR and core stats differently.</p>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>Simple Templates (Quick variants)</div>
                <ul>
                  <li><strong>Advanced:</strong> +1 CR, +4 to ability scores, +2 HP/HD, +4 AC/CMD.</li>
                  <li><strong>Giant:</strong> +1 CR, size +1 category, Str +4, Con +4, Dex –2, +3 natural armor.</li>
                  <li><strong>Young:</strong> –1 CR, size –1 category, Str –4, Con –4, Dex +4, reduced HP and AC.</li>
                  <li><strong>Celestial/Fiendish:</strong> Typically +0 or +1 CR (only +1 if base HD ≥ 5); add energy resistances, DR, SR, and smite abilities depending on alignment.</li>
                </ul>
                <div style={{ fontWeight: 700 }}>Acquired Templates (Late-life transformations)</div>
                <ul>
                  <li><strong>Skeleton/Zombie:</strong> Change the creature to Undead; recalculate HD/HP using Charisma; adjust CR and traits.</li>
                  <li><strong>Ghost/Lich:</strong> Adds Undead type and significant structural and mechanical changes (sometimes high CR).</li>
                </ul>
                <div style={{ fontWeight: 700 }}>Inherited Templates</div>
                <ul>
                  <li><strong>Half-Dragon/Half-Fiend:</strong> Part of the creature from birth; apply strong ability adjustments and traits at creation.</li>
                </ul>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, display: 'grid', gap: 6 }}>
                  <div style={{ fontWeight: 700 }}>Recommended Apply Sequence (for builder programs)</div>
                  <ol style={{ paddingLeft: 16 }}>
                    <li>Apply Size Changes (if template changes size).</li>
                    <li>Apply Ability Score Adjustments (templates, templates effects, and size modifiers).</li>
                    <li>Recalculate HP (accounting for CON and HD), feat count, and skill ranks.</li>
                    <li>Recalculate derived stats (AC, BAB, Saves, CMB/CMD, damage dice).</li>
                  </ol>
                </div>
              </div>
            </div>
          </details>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Determines durability, feats, and saves. You can override the HD die with the control next to the HD input.
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Ability Scores</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            {[
              { label: 'STR', value: str, onChange: onStrChange },
              { label: 'DEX', value: dex, onChange: onDexChange },
              { label: 'CON', value: con, onChange: onConChange },
              { label: 'INT', value: int, onChange: onIntChange },
              { label: 'WIS', value: wis, onChange: onWisChange },
              { label: 'CHA', value: cha, onChange: onChaChange },
            ].map(({ label, value, onChange }) => (
              <label key={label} style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
                {label}
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={value}
                  onChange={e => onChange(Number(e.target.value))}
                  style={{
                    border: '1px solid #cbd5f5',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                />
              </label>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Base stats for the creature. INT affects feats; CON affects HP.
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundationBuilder;
