import type { Meta, StoryObj } from '@storybook/react';
import { SettingsScreen } from './SettingsScreen';

const meta = {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBack: () => console.log('Back clicked'),
  },
} satisfies Meta<typeof SettingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
