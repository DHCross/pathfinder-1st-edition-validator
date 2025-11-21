import type { Meta, StoryObj } from '@storybook/react';
import MonsterBuilderWizard from '../components/MonsterBuilderWizard';

const meta: Meta<typeof MonsterBuilderWizard> = {
  title: 'Tools/Monster Builder Wizard',
  component: MonsterBuilderWizard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof MonsterBuilderWizard>;

export const Default: Story = {};
