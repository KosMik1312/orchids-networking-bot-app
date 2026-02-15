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
    onHome: () => console.log('Home clicked'),
    onAfisha: () => console.log('Afisha clicked'),
    onMyProfile: () => console.log('Profile clicked'),
    onBookings: () => console.log('Bookings clicked'),
    onFavorites: () => console.log('Favorites clicked'),
    onHelp: () => console.log('Help clicked'),
  },
} satisfies Meta<typeof BookingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
