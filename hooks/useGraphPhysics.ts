import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3-force-3d';
import { GraphData, NodeData, ClusterId } from '../types';
import { CLUSTERS } from '../constants';

// Define a custom interface for the d3-force-3d module since types might be loose
interface Simulation extends d3.Simulation<NodeData, any> {
  numDimensions(n: number): this;
  force(name: string, force?: any): this;
  velocityDecay(decay: number): this;
}

export const useGraphPhysics = (data: GraphData) => {
  const { nodes, links } = data;
  
  // We keep the simulation in a ref so we can stop it on unmount
  const simulationRef = useRef<Simulation | null>(null);

  // Initialize the simulation
  useEffect(() => {
    // Create physics simulation
    const sim = (d3.forceSimulation(nodes) as Simulation)
      .numDimensions(3) // Enable 3D
      // Global Repulsion (keep nodes apart)
      .force('charge', d3.forceManyBody().strength(-250).distanceMax(300))
      // Links (pull connected nodes together)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(40).strength(0.5))
      // Cluster Gravity (pull nodes toward their cluster centers)
      .force('cluster', (alpha: number) => {
        nodes.forEach((node) => {
          const cluster = CLUSTERS[node.cluster];
          if (cluster) {
            const [tx, ty, tz] = cluster.center;
            // Manual gravity implementation toward target point
            const k = alpha * 0.15; // Strength of cluster pull
            if (node.vx !== undefined) node.vx += (tx - (node.x || 0)) * k;
            if (node.vy !== undefined) node.vy += (ty - (node.y || 0)) * k;
            if (node.vz !== undefined) node.vz += (tz - (node.z || 0)) * k;
          }
        });
      })
      // Centering force to keep the whole graph near origin slightly
      .force('center', d3.forceCenter(0, 0, 0).strength(0.01))
      .velocityDecay(0.4); // Add drag to stop it flying away

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [nodes, links]);

  return simulationRef;
};