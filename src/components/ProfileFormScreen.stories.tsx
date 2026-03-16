import type { Meta, StoryObj } from '@storybook/react';
import { ProfileFormScreen } from './ProfileFormScreen';

const meta = {
  title: 'Screens/ProfileFormScreen',
  component: ProfileFormScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onContinue: (data) => console.log('Profile form data:', data),
    onBack: () => console.log('Back clicked'),
    initialData: {
      name: '',
      gender: '',
      age: 25,
      zodiac: '',
      career: '',
      familyStatus: '',
      hasChildren: '',
    },
  },
} satisfies Meta<typeof ProfileFormScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
