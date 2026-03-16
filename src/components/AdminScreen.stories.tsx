import type { Meta, StoryObj } from '@storybook/react';
import { AdminScreen } from './AdminScreen';
import type { AdminStats, AdminUser, AdminSlot, AdminGroup } from '@/lib/adminApi';

const meta = {
  title: 'Screens/AdminScreen',
  component: AdminScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    token: 'mock-admin-token-123',
    onBack: () => console.log('Back clicked'),
    isAuthorized: true,
  },
} satisfies Meta<typeof AdminScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock данные
const mockStats: AdminStats = {
  total_users: 156,
  total_slots: 12,
  active_slots: 5,
  total_bookings: 89,
  total_paid: 45000,
};

const mockUsers: AdminUser[] = [
  {
    user_id: 1,
    name: "Алексей Петров",
    age: 28,
    gender: "male",
    city: "Москва",
    telegram: "@alex_petrov",
    instagram: "alex.petrov",
    is_profile_completed: true,
    created_at: "2024-01-15",
  },
  {
    user_id: 2,
    name: "Мария Сидорова",
    age: 25,
    gender: "female",
    city: "Санкт-Петербург",
    telegram: "@maria_sid",
    instagram: null,
    is_profile_completed: true,
    created_at: "2024-02-10",
  },
  {
    user_id: 3,
    name: "Иван Иванов",
    age: 32,
    gender: "male",
    city: "Казань",
    telegram: null,
    instagram: "ivan_design",
    is_profile_completed: false,
    created_at: "2024-02-14",
  },
];

const mockSlots: AdminSlot[] = [
  {
    id: 1,
    date: "20.02.2026",
    time: "19:00",
    city: "Москва",
    restaurant: "Le Petit Bistro",
    max_people: 12,
    current_bookings: 8,
    is_active: true,
    created_at: "2024-02-01",
    price: 1500,
  },
  {
    id: 2,
    date: "22.02.2026",
    time: "19:30",
    city: "Санкт-Петербург",
    restaurant: "Seasons",
    max_people: 10,
    current_bookings: 7,
    is_active: true,
    created_at: "2024-02-05",
    price: 1500,
  },
  {
    id: 3,
    date: "25.02.2026",
    time: "20:00",
    city: "Москва",
    restaurant: "Минимализм",
    max_people: 15,
    current_bookings: 3,
    is_active: false,
    created_at: "2024-02-08",
    price: 1500,
  },
];

const mockGroups: AdminGroup[] = [
  {
    id: 1,
    name: "VIP Члены",
    created_at: "2024-01-20",
    member_count: 23,
  },
  {
    id: 2,
    name: "Постоянные клиенты",
    created_at: "2024-01-25",
    member_count: 67,
  },
  {
    id: 3,
    name: "Новички",
    created_at: "2024-02-01",
    member_count: 15,
  },
];

export const Dashboard: Story = {
  args: {
    mockStats,
    mockUsers: [],
    mockSlots: [],
    mockGroups: [],
    initialTab: "dashboard",
  },
};

export const Users: Story = {
  args: {
    mockStats,
    mockUsers,
    mockSlots: [],
    mockGroups: [],
    initialTab: "users",
  },
};

export const Slots: Story = {
  args: {
    mockStats,
    mockUsers: [],
    mockSlots,
    mockGroups: [],
    initialTab: "slots",
  },
};

export const Groups: Story = {
  args: {
    mockStats,
    mockUsers: [],
    mockSlots,
    mockGroups,
    initialTab: "groups",
  },
};

export const Broadcast: Story = {
  args: {
    mockStats,
    mockUsers: [],
    mockSlots,
    mockGroups,
    initialTab: "broadcast",
  },
};

export const Unauthorized: Story = {
  args: {
    isAuthorized: false,
    mockStats: undefined,
    mockUsers: [],
    mockSlots: [],
    mockGroups: [],
  },
};
