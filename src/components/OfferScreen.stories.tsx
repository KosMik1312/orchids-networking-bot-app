import type { Meta, StoryObj } from '@storybook/react';
import { OfferScreen } from './OfferScreen';

const meta = {
    title: 'Screens/Legal/OfferScreen',
    component: OfferScreen,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        onBack: () => console.log('Back clicked!'),
    },
} satisfies Meta<typeof OfferScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
