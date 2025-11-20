import React, { useState, useEffect } from 'react';
import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { scaleCreature } from '../engine/creatureScaler';
import { formatPF1eStatBlock } from '../lib/pf1e-formatter';
import { XP_Table } from '../rules/pf1e-data-tables';
import './CreatureScaler.css';

interface CreatureScalerProps {
    initialBlock: PF1eStatBlock;
}

export const CreatureScaler: React.FC<CreatureScalerProps> = ({ initialBlock }) => {
    const [targetXP, setTargetXP] = useState(initialBlock.xp || 400);
    const [scaledBlock, setScaledBlock] = useState(initialBlock);
    const [changes, setChanges] = useState<string[]>([]);

    useEffect(() => {
        const result = scaleCreature(initialBlock, targetXP);
        setScaledBlock(result.block);
        setChanges(result.changes);
    }, [targetXP, initialBlock]);

    const xpSteps = Object.values(XP_Table).sort((a, b) => a - b);
    
    // Find closest step index
    const currentStepIndex = xpSteps.findIndex(x => x >= targetXP);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value);
        setTargetXP(xpSteps[index]);
    };

    return (
        <div className="creature-scaler">
            <div className="scaler-header">
                <h2>Difficulty Scaler</h2>
                <div className="scaler-controls">
                    <label>
                        <strong>Target XP: {targetXP.toLocaleString()}</strong> (CR {scaledBlock.cr})
                        <input 
                            type="range" 
                            min="0" 
                            max={xpSteps.length - 1} 
                            value={currentStepIndex === -1 ? 0 : currentStepIndex} 
                            onChange={handleSliderChange} 
                            style={{ width: '100%' }}
                        />
                    </label>
                </div>
            </div>
            
            <div className="scaler-content">
                <div className="scaler-block">
                    <h3>Scaled Stat Block</h3>
                    <pre className="stat-block-display">{formatPF1eStatBlock(scaledBlock)}</pre>
                </div>
                <div className="scaler-changes">
                    <h3>Auto-Adjustments</h3>
                    {changes.length === 0 ? (
                        <p>No changes needed.</p>
                    ) : (
                        <ul>
                            {changes.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
