import type { Meta, StoryObj } from '@storybook/react';
import { AdminScreen } from './AdminScreen';

const meta = {
  title: 'Screens/AdminScreen',
  component: AdminScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    token: 'mock-admin-token-123',
    onBack: () => console.log('Back clicked'),
  },
} satisfies Meta<typeof AdminScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
