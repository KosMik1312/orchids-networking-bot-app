import type { Meta, StoryObj } from '@storybook/react';
import { BottomNav } from './BottomNav';

const meta = {
    title: 'Components/BottomNav',
    component: BottomNav,
    parameters: {
        layout: 'fullscreen', // BottomNav is fixed to the bottom, so fullscreen makes sense
    },
    args: {
        activeTab: 'home',
        onTabChange: (tab) => console.log('Tab changed to:', tab),
    },
    argTypes: {
        activeTab: {
            control: { type: 'select' },
            options: ['home', 'afisha', 'profile'],
        },
    },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeActive: Story = {
    args: {
        activeTab: 'home',
    },
};

export const AfishaActive: Story = {
    args: {
        activeTab: 'afisha',
    },
};

export const ProfileActive: Story = {
    args: {
        activeTab: 'profile',
    },
};
