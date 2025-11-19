import React from 'react'; // <--- THIS IS THE MISSING KEY
import type { Meta, StoryObj } from '@storybook/react';
import { ValidatorDisplay } from '../components/ValidatorDisplay';
import { validateBasics } from '../engine/validateBasics';
import { validateEconomy } from '../engine/validateEconomy';
import { PF1eStatBlock } from '../types/PF1eStatBlock';

const meta: Meta<typeof ValidatorDisplay> = {
  title: 'Pathfinder/Validator',
  component: ValidatorDisplay,
};

export default meta;
type Story = StoryObj<typeof ValidatorDisplay>;

// Sample Data: Level 1 Fighter with too much gold
const OvergearedFighter: PF1eStatBlock = {
  name: 'Rich Rookie',
  creature_type: 'Humanoid',
  size: 'Medium',
  cr: 1,
  xp: 400,
  total_wealth_gp: 5000, // ERROR: Too much for Level 1
  class_levels: [{ class_name: 'Fighter', level_count: 1 }],
  racial_hd_count: 0,
  treasure_code: 'NPC gear',
  ability_scores: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 8 },
  feats: ['Power Attack', 'Cleave', 'Weapon Focus (Longsword)'], // Correct for Human Fighter 1
};

export const Full_Validation_Check: Story = {
  render: (args) => {
    const basics = validateBasics(args.statBlock);
    const economy = validateEconomy(args.statBlock);
    
    const combinedResult = {
        status: (basics.status === 'FAIL' || economy.status === 'FAIL') ? 'FAIL' 
              : (basics.status === 'WARN' || economy.status === 'WARN') ? 'WARN' 
              : 'PASS',
        messages: [...basics.messages, ...economy.messages]
    };

    return <ValidatorDisplay statBlock={args.statBlock} validation={combinedResult} />;
  },
  args: {
    statBlock: OvergearedFighter,
    validation: { status: 'PASS', messages: [] }
  },
};
