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
    onHome: () => console.log('Home clicked'),
    onAfisha: () => console.log('Afisha clicked'),
    onEditProfile: () => console.log('Edit profile clicked'),
    onBookings: () => console.log('Bookings clicked'),
    onFavorites: () => console.log('Favorites clicked'),
    onHelp: () => console.log('Help clicked'),
    onSettings: () => console.log('Settings clicked'),
  },
} satisfies Meta<typeof ProfileScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: {
    // added a specific required prop
    userName: 'Элис с фото',
  },
};

export const NewUser: Story = {
  args: {
    // another variation without unknown props
    userName: 'Новый Пользователь',
  },
};
