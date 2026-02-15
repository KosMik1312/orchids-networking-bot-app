import type { Meta, StoryObj } from '@storybook/react';
import { MyContactsScreen } from './MyContactsScreen';

const meta = {
  title: 'Screens/MyContactsScreen',
  component: MyContactsScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBack: () => console.log('Back clicked'),
  },
} satisfies Meta<typeof MyContactsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
