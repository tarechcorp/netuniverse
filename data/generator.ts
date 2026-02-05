import config from './config.json';
import { GraphData, NodeData, LinkData, ClusterId } from '../types';
import { CLUSTERS } from '../constants';

const NODE_COUNTS = {
  [ClusterId.Core]: 0,
  [ClusterId.Finance]: 0,
  [ClusterId.Social]: 0,
  [ClusterId.Infrastructure]: 0,
  [ClusterId.Network]: config.graph.network_node_count
};

export const generateGraphData = (): GraphData => {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];

  // Generate Nodes
  Object.values(CLUSTERS).forEach((cluster) => {
    const count = NODE_COUNTS[cluster.id];
    for (let i = 0; i < count; i++) {
      const id = `${cluster.id.toLowerCase()}-${i}`;
      const spread = cluster.id === ClusterId.Network ? config.graph.network_spread : 40;


      let x, y, z;
      if (cluster.id === ClusterId.Network) {
        // Spherical distribution for Universe circularity
        const r = Math.cbrt(Math.random()) * spread; // Cubic root for uniform density volume
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        x = cluster.center[0] + r * Math.sin(phi) * Math.cos(theta);
        y = cluster.center[1] + r * Math.sin(phi) * Math.sin(theta);
        z = cluster.center[2] + r * Math.cos(phi);
      }


      nodes.push({
        id,
        label: cluster.id === ClusterId.Network ? '' : `${cluster.label} Node ${i + 1}`,
        cluster: cluster.id,
        description: `High-performance node processing unit within the ${cluster.label} sector. Handles distributed consensus and data sharding.`,
        tags: ['Protocol', 'Level 2', 'Secure'],
        connections: [],
        size: cluster.id === ClusterId.Network ? 2 : (cluster.id === ClusterId.Core ? 32 : (Math.random() > 0.8 ? 16 : 6)),
        x, y, z
      });
    }
  });

  // Generate Links
  // 1. Network Constellation (Static Background) - connect to closest neighbors
  const networkNodes = nodes.filter(n => n.cluster === ClusterId.Network);
  // Optimization: Only connect a subset to avoid excessive lines (e.g., 30% of nodes get 1-2 links)
  // Or simple distance check for subset.
  // Let's connect closer nodes. To be fast, we'll just pick random pairs and keep them if close enough.
  // or just connect random nodes within a slightly larger index range (since they are generated sequentially in space?) 
  // No, spherical generation is random.

  // Efficient "Constellation" generation:
  // Sort by one axis to reduce search space roughly? No, simplified O(N*M) is fine for N=3000 in one-off generation.
  // Actually 3000^2 is 9M checks. Fast enough.

  // Actually 3000^2 is 9M checks. Fast enough.

  const MAX_DIST_SQ = config.graph.connection_distance * config.graph.connection_distance; // Max connection distance squared
  networkNodes.forEach((source, i) => {
    // Connect to 2 nearest neighbors max to keep it sparse
    if (Math.random() > 0.7) return; // Only 30% of nodes act as sources

    let closest: { dist: number, id: string }[] = [];

    // Check a random sample of other nodes or all? 
    // All is 3000. 1000 * 3000 = 3M ops. acceptable.
    networkNodes.forEach((target, j) => {
      if (i === j) return;
      const dx = (source.x || 0) - (target.x || 0);
      const dy = (source.y || 0) - (target.y || 0);
      const dz = (source.z || 0) - (target.z || 0);
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < MAX_DIST_SQ) {
        closest.push({ dist: distSq, id: target.id });
      }
    });

    // Sort and take top 2
    closest.sort((a, b) => a.dist - b.dist);
    closest.slice(0, 2).forEach(c => {
      links.push({ source: source.id, target: c.id, value: 0.2 });
    });
  });


  // 2. Intra-cluster links (dense) - Main Nodes
  nodes.filter(n => n.cluster !== ClusterId.Network).forEach((source, i) => {
    // Connect to 2-3 random neighbors in same cluster
    const sameCluster = nodes.filter(n => n.cluster === source.cluster && n.id !== source.id);
    const connectionCount = 2 + Math.floor(Math.random() * 2);

    for (let j = 0; j < connectionCount; j++) {
      const target = sameCluster[Math.floor(Math.random() * sameCluster.length)];
      if (target) {
        links.push({ source: source.id, target: target.id, value: 1 });
        source.connections.push(target.id);
      }
    }
  });

  // 2. Inter-cluster links (sparse bridges)
  const clusters = Object.values(CLUSTERS);
  clusters.forEach((sourceCluster) => {
    clusters.forEach((targetCluster) => {
      if (sourceCluster.id !== targetCluster.id) {
        // Create 2-3 bridges between clusters
        for (let i = 0; i < 3; i++) {
          const sourceNodes = nodes.filter(n => n.cluster === sourceCluster.id);
          const targetNodes = nodes.filter(n => n.cluster === targetCluster.id);

          const source = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
          const target = targetNodes[Math.floor(Math.random() * targetNodes.length)];

          if (source && target) {
            links.push({ source: source.id, target: target.id, value: 0.5 });
          }
        }
      }
    });
  });

  return { nodes, links };
};
