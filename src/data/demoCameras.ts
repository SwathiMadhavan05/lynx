import type { Camera } from '../types/schema';

export const demoCameras: Camera[] = [
  {
    id: 'CAM-01',
    label: 'Lobby Main',
    floor: '1',
    zone: 'Lobby',
    status: 'online',
    streamUrl: '',
  },
  {
    id: 'CAM-02',
    label: 'Corridor A',
    floor: '2',
    zone: 'Corridor A',
    status: 'online',
    streamUrl: '',
  },
  {
    id: 'CAM-03',
    label: 'Corridor B',
    floor: '3',
    zone: 'Corridor B',
    status: 'online',
    streamUrl: '',
  },
  {
    id: 'CAM-04',
    label: 'Stairwell',
    floor: '4',
    zone: 'Stairwell',
    status: 'offline',
    streamUrl: '',
  },
  {
    id: 'CAM-05',
    label: 'Reception',
    floor: '5',
    zone: 'Reception',
    status: 'online',
    streamUrl: '',
  },
];
