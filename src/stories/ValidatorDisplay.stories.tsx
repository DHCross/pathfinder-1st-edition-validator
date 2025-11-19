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
  cr: 1 as any,
  xp: 400 as any,
  total_wealth_gp: 5000 as any, // ERROR: Too much for Level 1
  class_levels: [{ class_name: 'Fighter', level_count: 1 } as any],
  racial_hd_count: 0 as any,
  treasure_code: 'NPC gear' as any,
  ability_scores: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 8 } as any,
  feats: ['Power Attack', 'Cleave', 'Weapon Focus (Longsword)'] as any,
};

export const Full_Validation_Check: Story = {
  render: (args) => {
    // Normalize alternate property names used in demo data so validators receive expected keys
    const normalized = {
      ...args.statBlock,
      gearValue: args.statBlock.gearValue || args.statBlock.total_wealth_gp || args.statBlock.total_wealth || args.statBlock.gear_value,
      classLevels: args.statBlock.classLevels || args.statBlock.class_levels || args.statBlock.class_levels_list,
      racialHD: args.statBlock.racialHD || args.statBlock.racial_hd_count,
    } as unknown as PF1eStatBlock;

    const basics = validateBasics(normalized);
    const economy = validateEconomy(normalized as PF1eStatBlock) as any;

    const combinedResult = {
      status: (basics.status === 'FAIL' || economy?.status === 'FAIL') ? 'FAIL'
        : (basics.status === 'WARN' || economy?.status === 'WARN') ? 'WARN'
        : 'PASS',
      messages: [...(basics.messages || []), ...(economy?.messages || [])],
    } as any;

    return <ValidatorDisplay statBlock={normalized} validation={combinedResult} />;
  },
  args: {
    statBlock: OvergearedFighter,
    validation: { status: 'PASS', messages: [] }
  },
};
