import type { Meta, StoryObj } from '@storybook/react';
import { WelcomeScreen } from './WelcomeScreen';

const meta = {
  title: 'Screens/WelcomeScreen',
  component: WelcomeScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onStart: () => console.log('Start clicked!'),
  },
} satisfies Meta<typeof WelcomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
