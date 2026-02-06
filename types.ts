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
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

export interface GraphRef {
  camera: THREE.PerspectiveCamera;
  flyTo: (position: [number, number, number], duration?: number) => void;
  lookAt: (target: [number, number, number], duration?: number) => void;
}

// For rendering lines efficiently
export interface LineCoords {
  start: THREE.Vector3;
  end: THREE.Vector3;
  opacity: number;
}

export interface GraphConfig {
  graph: {
    network_node_count: number;
    network_spread: number;
    connection_distance: number;
    grab_distance: number;
    camera_max_distance: number;
    initial_camera_position: [number, number, number];
    detail_view_distance: number;
    colors: {
      grab_line: string;
      network_node: string;
      network_line: string;
      click_active: string;
      background: string;
    };
    node_geometry?: {
      shape: 'circle' | 'polygon';
      polygon_sides?: number;
    };
  };
  animation: {
    bounce: {
      enabled: boolean;
      boundary_radius: number;
      rebound_factor: number;
      dampening: number;
    };
    click: {
      camera_duration: number;
      camera_ease: string;
    };
    highlight: {
      scale_hover: number;
      scale_selected: number;
      transition_duration: number;
    };
  };
  controls: {
    enableZoom: boolean;
    enablePan: boolean;
    enableRotate: boolean;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number | string;
    maxAzimuthAngle: number | string;
  };
}
