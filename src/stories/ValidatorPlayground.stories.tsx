import type { Meta, StoryObj } from '@storybook/react';
import { ValidatorPlayground } from '../components/ValidatorPlayground';
import { FixMode } from '../engine/autoFixer';

const OVERBUILT_SAMPLE = `Rat King Prime
CR 1
XP 400
CE Small Outsider
Init +6; Senses darkvision 60 ft.; Perception +9
DEFENSE
AC 20, touch 15, flat-footed 16 (+1 size, +4 Dex, +5 natural)
hp 42 (6d8+12)
Fort +9, Ref +9, Will +6
OFFENSE
Speed 30 ft., climb 20 ft.
Melee bite +12 (1d4+6 plus disease)
STATISTICS
Str 18, Dex 18, Con 14, Int 12, Wis 12, Cha 8
Base Atk +6; CMB +9; CMD 24
Feats Weapon Finesse, Lightning Reflexes, Toughness
Skills Acrobatics +14, Stealth +15, Perception +9
Languages Abyssal
Special Abilities
Disease (Bite) Filth Fever (DC 14)`;

const UNDERBUILT_SAMPLE = `Glass Scout
CR 4
XP 1,200
N Medium Humanoid (human)
Init +1; Senses Perception +4
DEFENSE
AC 14, touch 11, flat-footed 13 (+3 armor, +1 Dex)
hp 22 (3d8+9)
Fort +2, Ref +2, Will +4
OFFENSE
Speed 30 ft.
Melee longsword +4 (1d8+1)
STATISTICS
Str 12, Dex 12, Con 12, Int 10, Wis 14, Cha 8
Base Atk +2; CMB +3; CMD 14
Feats Alertness, Iron Will
Skills Perception +4, Survival +8
Languages Common`;

const meta: Meta<typeof ValidatorPlayground> = {
  title: 'Validators/Rules Lawyer Workbench',
  component: ValidatorPlayground,
  parameters: {
    layout: 'fullscreen',
    controls: { exclude: ['initialText'] },
  },
  args: {
    initialFixMode: 'enforce_cr' as FixMode,
  },
};

export default meta;
type Story = StoryObj<typeof ValidatorPlayground>;

export const BenchmarkGuardrails: Story = {
  name: 'Design Mode (HD/CR Guardrails)',
  args: {
    initialText: OVERBUILT_SAMPLE,
    initialFixMode: 'enforce_cr',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the HD/CR guardrail banner, benchmark tiles, and quick chassis helpers when forcing a CR 1 overbuilt stat block back into line.',
      },
    },
  },
};

export const AuditModeGlassJaw: Story = {
  name: 'Audit Mode (Benchmark Warnings)',
  args: {
    initialText: UNDERBUILT_SAMPLE,
    initialFixMode: 'fix_math',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the Rules Lawyer in Audit Mode, highlighting glass-jaw HP/AC deviations and letting reviewers compare raw inputs against legal chassis targets.',
      },
    },
  },
};

export const InteractiveWorkbench: Story = {
  name: 'Sandbox',
};
