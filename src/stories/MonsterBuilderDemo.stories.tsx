import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Examples/Monster Builder Demo',
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ExampleScreenshot: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h2>Monster Builder — Example Page (Static)</h2>
      <p style={{ marginBottom: 12 }}>A static, example screenshot of the Monster Builder UI — replace the placeholder image with your actual screenshot file in `src/stories/assets/`.</p>
      <img alt="Monster Builder Screenshot" src="./assets/monster-builder-screenshot.svg" style={{ borderRadius: 8, width: '100%', height: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
    </div>
  )
};
