import type { Meta, StoryObj } from '@storybook/react';
import { BookingScreen } from './BookingScreen';

const meta = {
  title: 'Screens/BookingScreen',
  component: BookingScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    city: 'Москва',
    authToken: 'mock-token-123',
    onProfile: () => console.log('Profile clicked'),
    onAfisha: () => console.log('Afisha clicked'),
    onSettings: () => console.log('Settings clicked'),
    onContacts: () => console.log('Contacts clicked'),
    onOffer: () => console.log('Offer clicked'),
  },
} satisfies Meta<typeof BookingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
