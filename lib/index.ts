// Library Entry Point
export { GraphScene } from '../GraphScene';
export { GalaxyGraph } from '../components/GalaxyGraph';
export { OverlayUI } from '../components/OverlayUI';

// Types
export type { GraphData, NodeData, LinkData, GraphRef, ClusterConfig } from '../types';
export { ClusterId } from '../types';

// Re-export config for consumers who want to use it
export { default as defaultConfig } from '../data/config.json';
export { generateGraphData } from '../data/generator';
