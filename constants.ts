import { ClusterId, ClusterConfig } from './types';

export const CLUSTERS: Record<ClusterId, ClusterConfig> = {
  [ClusterId.Core]: {
    id: ClusterId.Core,
    label: 'Core Systems',
    color: '#2F80ED', // Stronger Blue
    center: [0, 0, 0]
  },
  [ClusterId.Finance]: {
    id: ClusterId.Finance,
    label: 'DeFi Galaxy',
    color: '#D0021B', // Strong Red
    center: [150, 50, -50]
  },
  [ClusterId.Social]: {
    id: ClusterId.Social,
    label: 'Social Mesh',
    color: '#00A1E4', // Cyan/Blue
    center: [-120, 80, 50]
  },
  [ClusterId.Infrastructure]: {
    id: ClusterId.Infrastructure,
    label: 'Infra Cloud',
    color: '#9013FE', // Deep Purple
    center: [50, -100, 100]
  },
  [ClusterId.Network]: {
    id: ClusterId.Network,
    label: 'Global Network',
    color: '#95A5A6', // Darker Gray for background
    center: [0, 0, 0]
  }
};

export const INITIAL_CAMERA_POSITION = [0, 0, 400];
export const DETAIL_VIEW_DISTANCE = 40;
