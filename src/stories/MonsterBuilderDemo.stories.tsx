import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import BestiaryArchitectApp from '../modules/BestiaryArchitectApp';

const meta: Meta<typeof BestiaryArchitectApp> = {
  title: 'Tools/Bestiary Architect',
  component: BestiaryArchitectApp,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof BestiaryArchitectApp>;

export const Default: Story = {
  render: () => <BestiaryArchitectApp />,
};
