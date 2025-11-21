import type { Meta, StoryObj } from '@storybook/react-vite';
import MonsterBuilderWizard from '../components/MonsterBuilderWizard';
import { within, userEvent, expect } from 'storybook/test';

const meta: Meta<typeof MonsterBuilderWizard> = {
  title: 'Tools/Monster Builder Wizard',
  component: MonsterBuilderWizard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof MonsterBuilderWizard>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select the Chaos-Mutated Toad template which is intentionally high HD
    const selects = await canvas.getAllByRole('combobox');
    const select = selects[0];
    await userEvent.selectOptions(select, 'Chaos-Mutated Toad');

    // Move to Step 2 to adjust Racial HD so we exceed the structural threshold
    const nextBtn = await canvas.getByRole('button', { name: /Next/i });
    await userEvent.click(nextBtn);

    // Racial HD input is the first numeric input (spinbutton) on step 2
    const spinbuttons = await canvas.getAllByRole('spinbutton');
    const racialInput = spinbuttons[0];
    await userEvent.clear(racialInput);
    await userEvent.type(racialInput, '7');

    // Continue to Step 3 and enable Design Mode
    await userEvent.click(nextBtn);
    const designBtn = await canvas.getByRole('button', { name: /Design \(Enforce CR\)/i });
    await userEvent.click(designBtn);

    // The ValidatorDisplay should show a structural critical message for HD/CR mismatch
    await expect(canvas.getByText(/HD\/CR Mismatch/i)).toBeInTheDocument();

    // And the overall badge should indicate FAIL for the validated (fixed) version
    await expect(canvas.getByText(/FAIL.*Fixed/i)).toBeInTheDocument();

    // Finally, click the Download JSON button (verifies presence and clickability)
    const downloadBtn = await canvas.getByRole('button', { name: /Download JSON/i });
    await userEvent.click(downloadBtn);
    await expect(downloadBtn).toBeInTheDocument();
  }
};
