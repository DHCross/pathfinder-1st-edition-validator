import type { Meta, StoryObj } from '@storybook/react';
import { CreatureScaler } from './CreatureScaler';
import { PF1eStatBlock } from '../types/PF1eStatBlock';

const meta: Meta<typeof CreatureScaler> = {
  title: 'Components/CreatureScaler',
  component: CreatureScaler,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CreatureScaler>;

const sampleToad: PF1eStatBlock = {
    name: "Chaos-Mutated Toad",
    cr: "1",
    xp: 400,
    size: "Medium",
    type: "Outsider",
    subtypes: ["Chaotic", "Extraplanar"],
    racialHD: 2,
    hp: 15,
    ac: 12,
    fort: 4,
    ref: 4,
    will: 1,
    bab: 2,
    str: 12,
    dex: 12,
    con: 12,
    int: 2,
    wis: 10,
    cha: 6,
    feats: ["Toughness"],
    melee_line: "Bite +3 (1d6+1 plus grab)",
    special_attacks_line: "Tongue (Range 10 ft)",
    speed_line: "Speed 30 ft., swim 30 ft."
};

export const Default: Story = {
  args: {
    initialBlock: sampleToad,
  },
};

export const HighLevel: Story = {
    args: {
        initialBlock: {
            ...sampleToad,
            name: "Greater Chaos Toad",
            cr: "5",
            xp: 1600,
            racialHD: 6,
            hp: 55,
            size: "Large"
        }
    }
};
