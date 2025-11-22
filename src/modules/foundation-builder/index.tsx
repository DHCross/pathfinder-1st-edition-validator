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
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h2 style={{ margin: '0 0 4px' }}>{name} — Foundation</h2>
        <p style={{ margin: '0 0 12px', color: '#4b5563' }}>
          Choose how you want to start, set a target CR, and name the creature.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ fontWeight: 600, display: 'grid', gap: 6 }}>
          Creature Name
          <input
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="e.g., Embermaw Basilisk"
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 14,
            }}
          />
        </label>

        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Build Path</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PATHS.map(path => {
              const active = buildPath === path;
              return (
                <button
                  key={path}
                  onClick={() => onBuildPathChange(path)}
                  style={{
                    borderRadius: 999,
                    padding: '8px 14px',
                    border: active ? '1px solid #4338ca' : '1px solid #e5e7eb',
                    background: active ? '#eef2ff' : '#fff',
                    color: active ? '#312e81' : '#111827',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 4px #4338ca22' : 'none',
                  }}
                >
                  {path}
                </button>
              );
            })}
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            Monster for classic foes; NPC for humanoid gear; From-Scratch for blank canvas.
          </div>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
            Target CR
            <span style={{ color: '#6b7280', fontWeight: 500 }}>CR {targetCR}</span>
          </label>
          <input
            type="range"
            min={1}
            max={25}
            value={targetCR}
            onChange={e => onTargetCRChange(parseInt(e.target.value, 10))}
          />
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            This calibrates benchmarks for HP, saves, attacks, and treasure tiers.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationBuilder;
