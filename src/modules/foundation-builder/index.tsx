import React from 'react';

export type FoundationProps = {
  name: string;
  targetCR: number;
  buildPath: 'Monster' | 'NPC' | 'From-Scratch';
  onNameChange: (next: string) => void;
  onTargetCRChange: (next: number) => void;
  onBuildPathChange: (next: FoundationProps['buildPath']) => void;
};

const PATHS: Array<FoundationProps['buildPath']> = ['Monster', 'NPC', 'From-Scratch'];

export const FoundationBuilder: React.FC<FoundationProps> = ({
  name,
  targetCR,
  buildPath,
  onNameChange,
  onTargetCRChange,
  onBuildPathChange,
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
          <p style={{ margin: 0, color: '#475569' }}>Choose your build path, calibrate CR, and give the creature a name.</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#312e81', textTransform: 'uppercase', letterSpacing: 0.6 }}>Start here</span>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
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
                boxShadow: '0 2px 8px #1e3a8a18',
              }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>Required</span>
          </div>
        </label>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Build Path</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
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
      </div>
    </section>
  );
};

export default FoundationBuilder;
