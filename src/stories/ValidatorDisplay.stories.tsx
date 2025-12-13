import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ValidatorDisplay } from '../components/ValidatorDisplay';
import { validateBasics } from '../engine/validateBasics';
import { validateEconomy } from '../engine/validateEconomy';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';

const meta: Meta<typeof ValidatorDisplay> = {
  title: 'Pathfinder/Validator',
  component: ValidatorDisplay,
};

export default meta;
type Story = StoryObj<typeof ValidatorDisplay>;

// Sample Data: Level 1 Fighter with too much gold
const OvergearedFighter: PF1eStatBlock = {
  name: 'Rich Rookie',
  type: 'Humanoid',
  size: 'Medium',
  cr: '1',
  xp: 400,
  gearValue: 5000,
  classLevels: [{ className: 'Fighter', level: 1 }],
  racialHD: 0,
  treasureType: 'NPC Gear',
  str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 8,
  feats: ['Power Attack', 'Cleave', 'Weapon Focus (Longsword)'],
  hp: 12,
  ac: 16,
  fort: 4,
  ref: 1,
  will: 0,
  bab: 1,
};

export const Full_Validation_Check: Story = {
  render: (args: { statBlock: PF1eStatBlock; validation: ValidationResult }) => {
    const basics = validateBasics(args.statBlock);
    const economy = validateEconomy(args.statBlock);
    
    const combinedResult: ValidationResult = {
        valid: basics.valid && economy.valid,
        status: (basics.status === 'FAIL' || economy.status === 'FAIL') ? 'FAIL' 
              : (basics.status === 'WARN' || economy.status === 'WARN') ? 'WARN' 
              : 'PASS',
        messages: [...basics.messages, ...economy.messages]
    };

    return <ValidatorDisplay statBlock={args.statBlock} validation={combinedResult} />;
  },
  args: {
    statBlock: OvergearedFighter,
    validation: { valid: true, status: 'PASS', messages: [] }
  },
};
