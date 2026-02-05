import * as THREE from 'three';

export enum ClusterId {
  Core = 'CORE',
  Finance = 'FINANCE',
  Social = 'SOCIAL',
  Infrastructure = 'INFRA',
  Network = 'NETWORK'
}

export interface ClusterConfig {
  id: ClusterId;
  label: string;
  color: string;
  center: [number, number, number]; // Target gravity center for this cluster
}

export interface NodeData {
  id: string;
  label: string;
  cluster: ClusterId;
  description: string;
  tags: string[];
  connections: string[];
  size: number; // Visual size in pixels
  // Physics properties (d3-force adds these)
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

export interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  value: number;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

// For rendering lines efficiently
export interface LineCoords {
  start: THREE.Vector3;
  end: THREE.Vector3;
  opacity: number;
}
