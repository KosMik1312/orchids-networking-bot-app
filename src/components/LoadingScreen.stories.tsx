import type { Meta, StoryObj } from '@storybook/react';
import { LoadingScreen } from './LoadingScreen';

const meta = {
  title: 'Screens/LoadingScreen',
  component: LoadingScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    message: 'Загрузка...',
  },
} satisfies Meta<typeof LoadingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: 'Поиск пары для встречи...',
  },
};
