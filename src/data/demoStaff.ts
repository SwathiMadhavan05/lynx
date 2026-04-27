import type { Staff } from '../types/schema';

export const demoStaff: Staff[] = [
  {
    id: 'swathi-manager',
    name: 'Swathi',
    email: 'staff@lynx.com',
    role: 'Manager',
    floor: 'All',
    isOnDuty: true,
    fcmToken: null,
  },
  {
    id: 'mila-response',
    name: 'Mila Chen',
    email: 'mila@lynx.com',
    role: 'Responder',
    floor: '2',
    isOnDuty: true,
    fcmToken: null,
  },
  {
    id: 'aarav-security',
    name: 'Aarav Patel',
    email: 'aarav@lynx.com',
    role: 'Security',
    floor: '3',
    isOnDuty: true,
    fcmToken: null,
  },
  {
    id: 'nina-ops',
    name: 'Nina Brooks',
    email: 'nina@lynx.com',
    role: 'Operations',
    floor: '5',
    isOnDuty: false,
    fcmToken: null,
  },
];
