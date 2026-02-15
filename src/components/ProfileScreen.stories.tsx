import type { Meta, StoryObj } from '@storybook/react';
import { ProfileScreen } from './ProfileScreen';

const meta = {
  title: 'Screens/ProfileScreen',
  component: ProfileScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    city: 'Москва',
    userName: 'Элис',
    userPhoto: null,
    completedMeetings: 5,
    totalMeetings: 10,
    onHome: () => console.log('Home clicked'),
    onAfisha: () => console.log('Afisha clicked'),
    onMyProfile: () => console.log('Profile clicked'),
    onBookings: () => console.log('Bookings clicked'),
    onFavorites: () => console.log('Favorites clicked'),
    onHelp: () => console.log('Help clicked'),
    onEditProfile: () => console.log('Edit profile clicked'),
    onSettings: () => console.log('Settings clicked'),
  },
} satisfies Meta<typeof ProfileScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: {
    userPhoto: 'https://via.placeholder.com/150',
  },
};

export const NewUser: Story = {
  args: {
    completedMeetings: 0,
    totalMeetings: 0,
  },
};
