import type { Meta, StoryObj } from '@storybook/react';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';

const meta = {
    title: 'Screens/Legal/PrivacyPolicyScreen',
    component: PrivacyPolicyScreen,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        onBack: () => console.log('Back clicked!'),
    },
} satisfies Meta<typeof PrivacyPolicyScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
