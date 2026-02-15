import type { Meta, StoryObj } from '@storybook/react';
import { BestInMeScreen } from './BestInMeScreen';

const meta = {
  title: 'Screens/BestInMeScreen',
  component: BestInMeScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onContinue: (data) => console.log('BestInMe form data:', data),
    onBack: () => console.log('Back clicked'),
  },
} satisfies Meta<typeof BestInMeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
