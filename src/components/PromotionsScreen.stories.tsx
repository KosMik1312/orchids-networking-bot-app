import type { Meta, StoryObj } from '@storybook/react';
import { PromotionsScreen } from './PromotionsScreen';

const meta = {
  title: 'Screens/PromotionsScreen',
  component: PromotionsScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBack: () => console.log('Back clicked'),
  },
} satisfies Meta<typeof PromotionsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
