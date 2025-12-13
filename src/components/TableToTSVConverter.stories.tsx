import type { Meta, StoryObj } from '@storybook/react';
import { TableToTSVConverter } from './TableToTSVConverter';

const meta: Meta<typeof TableToTSVConverter> = {
    title: 'Tools/TableToTSVConverter',
    component: TableToTSVConverter,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableToTSVConverter>;

export const Default: Story = {
    args: {},
};

export const WithMarkdownInput: Story = {
    args: {
        defaultInput: `## Goblin Warrior

| Stat | Value |
|------|-------|
| AC | 16, touch 13, flat-footed 13 |
| HP | 6 (1d10+1) |
| Fort | +3 |
| Ref | +1 |
| Will | -1 |

## Offense

| Attack | Damage |
|--------|--------|
| Short sword | +2 (1d4/19-20) |
| Short bow | +4 (1d4/×3) |`,
    },
};

export const WithHTMLInput: Story = {
    args: {
        defaultInput: `<table>
  <tr>
    <th>Stat</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>AC</td>
    <td>16, touch 13, flat-footed 13</td>
  </tr>
  <tr>
    <td>HP</td>
    <td>6 (1d10+1)</td>
  </tr>
  <tr>
    <td>Fort</td>
    <td>+3</td>
  </tr>
  <tr>
    <td>Ref</td>
    <td>+1</td>
  </tr>
  <tr>
    <td>Will</td>
    <td>-1</td>
  </tr>
</table>`,
    },
};

export const PathfinderStatblock: Story = {
    args: {
        defaultInput: `## Orc Warrior CR 1/3

| Attribute | Value |
|-----------|-------|
| XP | 135 |
| CE Medium humanoid (orc) |  |
| Init | +0 |
| Senses | darkvision 60 ft.; Perception -1 |

### Defense

| Defense | Value |
|---------|-------|
| AC | 13, touch 10, flat-footed 13 (+3 armor) |
| hp | 6 (1d10+1) |
| Fort | +3, Ref +0, Will -1 |
| Defensive Abilities | ferocity |
| Weaknesses | light sensitivity |

### Offense

| Offense | Value |
|---------|-------|
| Speed | 30 ft. |
| Melee | falchion +5 (2d4+4/18-20) |
| Ranged | javelin +1 (1d6+3) |`,
    },
};
