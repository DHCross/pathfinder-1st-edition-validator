import React from 'react';

export type FoundationProps = {
  name: string;
  targetCR: number;
  creatureType: string;
  hd: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  buildPath: 'Monster' | 'NPC' | 'From-Scratch';
  onNameChange: (next: string) => void;
  onTargetCRChange: (next: number) => void;
  onCreatureTypeChange: (next: string) => void;
  onHdChange: (next: number) => void;
  onStrChange: (next: number) => void;
  onDexChange: (next: number) => void;
  onConChange: (next: number) => void;
  onIntChange: (next: number) => void;
  onWisChange: (next: number) => void;
  onChaChange: (next: number) => void;
  onBuildPathChange: (next: FoundationProps['buildPath']) => void;
  onLoadPreset?: (preset: 'NastyBeast') => void;
};

const PATHS: Array<FoundationProps['buildPath']> = ['Monster', 'NPC', 'From-Scratch'];

export const FoundationBuilder: React.FC<FoundationProps> = ({
  name,
  targetCR,
  creatureType,
  hd,
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
}) => {
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
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>Target CR</div>
            <span style={{ fontSize: 13, color: '#475569' }}>CR {targetCR}</span>
          </div>
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
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Hit Dice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
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
            <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
              {creatureType === 'Dragon' ? 'd12' : creatureType === 'Fey' ? 'd6' : (creatureType === 'Construct' || creatureType === 'Magical Beast' || creatureType === 'Monstrous Humanoid' || creatureType === 'Outsider') ? 'd10' : 'd8'}
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Determines durability, feats, and saves. HD die size is locked to your creature type.
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
