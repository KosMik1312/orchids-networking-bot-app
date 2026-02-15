import type { Meta, StoryObj } from '@storybook/react';
import { MeetingConditionsScreen } from './MeetingConditionsScreen';

const meta = {
  title: 'Screens/MeetingConditionsScreen',
  component: MeetingConditionsScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onContinue: (data) => console.log('Meeting conditions data:', data),
    onBack: () => console.log('Back clicked'),
    initialData: {
      metro: [],
      days: [],
      time: { from: '10:00', to: '22:00' },
      goal: '',
      format: '',
    },
  },
} satisfies Meta<typeof MeetingConditionsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
