import type { Meta, StoryObj } from '@storybook/react-vite';
import BestiaryArchitectApp from '../modules/BestiaryArchitectApp';
import { within, userEvent, expect } from 'storybook/test';

const meta: Meta<typeof BestiaryArchitectApp> = {
  title: 'Tools/Monster Builder Wizard',
  component: BestiaryArchitectApp,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BestiaryArchitectApp>;

export const Default: Story = {
  render: () => <BestiaryArchitectApp />
};
};
