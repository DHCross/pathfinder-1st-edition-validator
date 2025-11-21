import React from 'react';

export type FoundationProps = {
  name?: string;
  targetCR?: number;
};

export const FoundationBuilder: React.FC<FoundationProps> = ({ name = 'New Creature', targetCR = 1 }) => {
  return (
    <div style={{ padding: 8 }}>
      <h2>{name} — Foundation</h2>
      <p>Target CR: {targetCR}. Start by choosing NPC, Monster, or From-Scratch.</p>
    </div>
  );
};

export default FoundationBuilder;
