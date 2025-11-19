import type { Meta, StoryObj } from '@storybook/react';
import { ValidatorPlayground } from '../components/ValidatorPlayground';

const meta: Meta<typeof ValidatorPlayground> = {
  title: 'Validators/Rules Lawyer Workbench',
  component: ValidatorPlayground,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ValidatorPlayground>;

export const InteractiveWorkbench: Story = {};
