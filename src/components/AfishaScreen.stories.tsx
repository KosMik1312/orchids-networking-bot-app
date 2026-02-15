import type { Meta, StoryObj } from '@storybook/react';
import { AfishaScreen } from './AfishaScreen';

const meta = {
  title: 'Screens/AfishaScreen',
  component: AfishaScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    city: 'Москва',
    onFavorites: () => console.log('Favorites clicked'),
    onHome: () => console.log('Home clicked'),
    onProfile: () => console.log('Profile clicked'),
    onBook: (eventId: number) => console.log(`Book event ${eventId}`),
    favoriteIds: new Set(),
    onToggleFavorite: (eventId: number) => console.log(`Toggle favorite ${eventId}`),
  },
} satisfies Meta<typeof AfishaScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFavorites: Story = {
  args: {
    favoriteIds: new Set([1, 2]),
  },
};
