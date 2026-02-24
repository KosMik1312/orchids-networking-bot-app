import type { Meta, StoryObj } from '@storybook/react';
import { ConsentScreen } from './ConsentScreen';

const meta = {
    title: 'Screens/Legal/ConsentScreen',
    component: ConsentScreen,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        onBack: () => console.log('Back clicked!'),
    },
} satisfies Meta<typeof ConsentScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
