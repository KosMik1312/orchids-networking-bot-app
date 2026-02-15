import type { Meta, StoryObj } from '@storybook/react';
import { FavoritesScreen } from './FavoritesScreen';

const meta = {
  title: 'Screens/FavoritesScreen',
  component: FavoritesScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    favoriteIds: new Set([1, 3]),
    onBack: () => console.log('Back clicked'),
    onBook: (eventId: number) => console.log(`Book event ${eventId}`),
    onToggleFavorite: (eventId: number) => console.log(`Toggle favorite ${eventId}`),
  },
} satisfies Meta<typeof FavoritesScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    favoriteIds: new Set(),
  },
};
