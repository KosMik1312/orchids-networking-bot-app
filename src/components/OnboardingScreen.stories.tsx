import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingScreen } from './OnboardingScreen';

const meta = {
  title: 'Screens/OnboardingScreen',
  component: OnboardingScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onComplete: () => console.log('Onboarding completed!'),
  },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
