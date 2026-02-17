import type { Meta, StoryObj } from '@storybook/react';
import { MyBookingsScreen } from './MyBookingsScreen';

const meta = {
  title: 'Screens/MyBookingsScreen',
  component: MyBookingsScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    city: 'Москва',
    authToken: 'mock-token-123',
    onBack: () => console.log('Back clicked'),
  },
} satisfies Meta<typeof MyBookingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithManyBookings: Story = {
  args: {
    authToken: 'mock-token-with-bookings',
  },
};

export const EmptyBookings: Story = {
  args: {
    authToken: 'mock-token-empty',
  },
};

export const LoadingState: Story = {
  args: {
    authToken: null,
  },
};
