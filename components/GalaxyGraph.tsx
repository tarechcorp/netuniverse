import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { GraphData, NodeData, GraphConfig } from '../types';
import { CLUSTERS, DETAIL_VIEW_DISTANCE } from '../constants';
import { useGraphPhysics } from '../hooks/useGraphPhysics';

interface GalaxyGraphProps {
  data: GraphData;
  onNodeSelect: (node: NodeData | null) => void;
  selectedNodeId: string | null;
  config: GraphConfig;
}

// Helper to generate polygon clip-path
const calculatePolygonClipPath = (sides: number) => {
  if (sides < 3) return 'none'; // Fallback
  const points = [];
  for (let i = 0; i < sides; i++) {
    // Start from top (-PI/2)
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
};

export const GalaxyGraph: React.FC<GalaxyGraphProps> = ({ data, onNodeSelect, selectedNodeId, config }) => {
  const { nodes, links } = data;
  const { camera, controls, mouse, raycaster } = useThree() as any;

  // Split Nodes
  const mainNodes = useMemo(() => nodes.filter(n => n.cluster !== 'NETWORK'), [nodes]);
  const networkNodes = useMemo(() => nodes.filter(n => n.cluster === 'NETWORK'), [nodes]);

  // Split Links
  const { staticLinks, dynamicLinks } = useMemo(() => {
    const staticL = [];
    const dynamicL = [];
    const nodeClusterMap = new Map<string, string>();
    nodes.forEach(n => nodeClusterMap.set(n.id, n.cluster));

    for (const l of links) {
      let sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      let tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      const sCluster = nodeClusterMap.get(sId);
      const tCluster = nodeClusterMap.get(tId);

      if (sCluster === 'NETWORK' && tCluster === 'NETWORK') {
        staticL.push({ source: sId, target: tId });
      } else {
        dynamicL.push(l);
      }
    }
    return { staticLinks: staticL, dynamicLinks: dynamicL };
  }, [nodes, links]);

  // Physics
  useGraphPhysics({
    nodes: mainNodes,
    links: dynamicLinks.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return mainNodes.find(n => n.id === sId) && mainNodes.find(n => n.id === tId);
    })
  }, config);

  // --- Particles ---
  const count = networkNodes.length;

  // Positions
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    networkNodes.forEach((n, i) => {
      arr[i * 3] = n.x || 0;
      arr[i * 3 + 1] = n.y || 0;
      arr[i * 3 + 2] = n.z || 0;
    });
    return arr;
  }, [networkNodes, count]);

  // Velocities
  const particleVelocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.5;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return arr;
  }, [count]);

  // Indices
  const linkIndices = useMemo(() => {
    const map = new Map<string, number>();
    networkNodes.forEach((n, i) => map.set(n.id, i));
    const indices: number[] = [];
    staticLinks.forEach(l => {
      const s = map.get(l.source as string);
      const t = map.get(l.target as string);
      if (s !== undefined && t !== undefined) {
        indices.push(s, t);
      }
    });
    return indices;
  }, [staticLinks, networkNodes]);

  // Refs
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const staticLinesRef = useRef<THREE.BufferGeometry>(null);
  const grabLinesRef = useRef<THREE.BufferGeometry>(null);
  const dynamicLinesRef = useRef<THREE.BufferGeometry>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  // Interaction State
  const mouseClickRef = useRef(false);
  const colorLerpRef = useRef(0);
  const staticLineMatRef = useRef<THREE.LineBasicMaterial>(null);

  useEffect(() => {
    const down = () => { mouseClickRef.current = true; };
    const up = () => { mouseClickRef.current = false; };
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    }
  }, []);

  // Frame Loop
  useFrame(() => {
    // 1. Interactions & Movement
    if (meshRef.current) {
      raycaster.setFromCamera(mouse, camera);
      const rayOrigin = raycaster.ray.origin;
      const rayDir = raycaster.ray.direction;
      const interactionTarget = new THREE.Vector3().copy(rayOrigin).add(rayDir.clone().multiplyScalar(800));

      const grabDistSq = config.graph.grab_distance * config.graph.grab_distance;
      const grabPositions: number[] = [];

      for (let i = 0; i < count; i++) {
        let px = particlePositions[i * 3];
        let py = particlePositions[i * 3 + 1];
        let pz = particlePositions[i * 3 + 2];

        // Move
        px += particleVelocities[i * 3];
        py += particleVelocities[i * 3 + 1];
        pz += particleVelocities[i * 3 + 2];

        // Bounds
        const distSqPos = px * px + py * py + pz * pz;
        if (distSqPos > 4000 * 4000) {
          const factor = -0.01;
          particleVelocities[i * 3] += px * factor * 0.001;
          particleVelocities[i * 3 + 1] += py * factor * 0.001;
          particleVelocities[i * 3 + 2] += pz * factor * 0.001;
        }

        // Grab Interaction Check
        const dx = px - interactionTarget.x;
        const dy = py - interactionTarget.y;
        const dz = pz - interactionTarget.z;
        const dSq = dx * dx + dy * dy + dz * dz;

        if (dSq < grabDistSq) {
          grabPositions.push(px, py, pz);
          grabPositions.push(interactionTarget.x, interactionTarget.y, interactionTarget.z);
        }

        // Dampen
        particleVelocities[i * 3] *= 0.99;
        particleVelocities[i * 3 + 1] *= 0.99;
        particleVelocities[i * 3 + 2] *= 0.99;

        particlePositions[i * 3] = px;
        particlePositions[i * 3 + 1] = py;
        particlePositions[i * 3 + 2] = pz;

        // Convert to Matrix
        tempObject.position.set(px, py, pz);
        tempObject.scale.set(2, 2, 2);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;

      // Update Grab Lines
      if (grabLinesRef.current) {
        grabLinesRef.current.setAttribute('position', new THREE.Float32BufferAttribute(grabPositions, 3));
        grabLinesRef.current.setDrawRange(0, grabPositions.length / 3);
      }

      // Color Animation (Shift to Cyan on Click)
      const targetLerp = mouseClickRef.current ? 1 : 0;
      colorLerpRef.current += (targetLerp - colorLerpRef.current) * 0.1;

      const baseColor = new THREE.Color(config.graph.colors.network_node); // #BDC3C7
      const activeColor = new THREE.Color(config.graph.colors.click_active); // #00dce4
      const currColor = baseColor.clone().lerp(activeColor, colorLerpRef.current);

      if (meshRef.current.material) {
        (meshRef.current.material as THREE.MeshBasicMaterial).color.copy(currColor);
      }
      if (staticLineMatRef.current) {
        staticLineMatRef.current.color.copy(currColor);
      }
    }

    // 2. Static Lines Update (Follow Particles)
    if (staticLinesRef.current) {
      const positions = new Float32Array(linkIndices.length * 3);
      let ptr = 0;
      for (let j = 0; j < linkIndices.length; j += 2) {
        const idx1 = linkIndices[j];
        const idx2 = linkIndices[j + 1];

        positions[ptr++] = particlePositions[idx1 * 3];
        positions[ptr++] = particlePositions[idx1 * 3 + 1];
        positions[ptr++] = particlePositions[idx1 * 3 + 2];

        positions[ptr++] = particlePositions[idx2 * 3];
        positions[ptr++] = particlePositions[idx2 * 3 + 1];
        positions[ptr++] = particlePositions[idx2 * 3 + 2];
      }
      staticLinesRef.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

    // 3. Dynamic Lines Update
    if (dynamicLinesRef.current) {
      const positions: number[] = [];
      const colors: number[] = [];
      dynamicLinks.forEach(link => {
        let sId = link.source;
        let tId = link.target;
        if (typeof sId === 'object') sId = (sId as any).id;
        if (typeof tId === 'object') tId = (tId as any).id;

        const sNode = mainNodes.find(n => n.id === sId);
        const tNode = mainNodes.find(n => n.id === tId);

        if (sNode && tNode &&
          typeof sNode.x === 'number' && !isNaN(sNode.x) &&
          typeof sNode.y === 'number' && !isNaN(sNode.y) &&
          typeof tNode.x === 'number' && !isNaN(tNode.x) &&
          typeof tNode.y === 'number' && !isNaN(tNode.y)) {

          const sz = (typeof sNode.z === 'number' && !isNaN(sNode.z)) ? sNode.z : 0;
          const tz = (typeof tNode.z === 'number' && !isNaN(tNode.z)) ? tNode.z : 0;

          positions.push(sNode.x, sNode.y, sz);
          positions.push(tNode.x, tNode.y, tz);

          colors.push(0.4, 0.4, 0.4);
          colors.push(0.4, 0.4, 0.4);
        }
      });
      dynamicLinesRef.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      dynamicLinesRef.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      dynamicLinesRef.current.attributes.position.needsUpdate = true;
      dynamicLinesRef.current.attributes.color.needsUpdate = true;
      dynamicLinesRef.current.setDrawRange(0, positions.length / 3);
    }
  });

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleNodeClick = useCallback((node: NodeData) => {
    onNodeSelect(node);
    if (node.x !== undefined) {
      const targetPos = new THREE.Vector3(node.x, node.y, node.z);
      const currentCameraPos = camera.position.clone();
      const direction = currentCameraPos.sub(targetPos).normalize();
      const endPos = targetPos.clone().add(direction.multiplyScalar(DETAIL_VIEW_DISTANCE));

      gsap.to(camera.position, {
        x: endPos.x, y: endPos.y, z: endPos.z, duration: 1.5, ease: "power3.inOut"
      });
      if (controls) {
        gsap.to(controls.target, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.5, ease: "power3.inOut" });
      }
    }
  }, [camera, controls, onNodeSelect]);

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, networkNodes.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#BDC3C7" transparent opacity={0.8} />
      </instancedMesh>

      {/* Constellation Lines */}
      <lineSegments>
        <bufferGeometry ref={staticLinesRef} />
        <lineBasicMaterial ref={staticLineMatRef} color="#BDC3C7" transparent opacity={0.15} depthWrite={false} linewidth={1} />
      </lineSegments>

      {/* Grab Lines (Interaction) */}
      <lineSegments>
        <bufferGeometry ref={grabLinesRef} />
        <lineBasicMaterial color={config.graph.colors.grab_line} transparent opacity={0.3} depthWrite={false} linewidth={1} />
      </lineSegments>

      {/* Main Dynamic Lines */}
      <lineSegments>
        <bufferGeometry ref={dynamicLinesRef} />
        <lineBasicMaterial color="#000000" transparent opacity={0.6} depthWrite={false} linewidth={2} vertexColors />
      </lineSegments>

      {mainNodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id}
          hovered={hoveredNodeId === node.id}
          dimmed={hoveredNodeId !== null && hoveredNodeId !== node.id && !node.connections.includes(hoveredNodeId)}
          onClick={() => handleNodeClick(node)}
          onHover={(isHovering) => setHoveredNodeId(isHovering ? node.id : null)}
          config={config}
        />
      ))}
    </>
  );
};

const GraphNode: React.FC<{
  node: NodeData;
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
  config: GraphConfig;
}> = ({ node, selected, hovered, dimmed, onClick, onHover, config }) => {
  const ref = useRef<THREE.Group>(null);
  const clusterConfig = CLUSTERS[node.cluster];
  const color = clusterConfig ? clusterConfig.color : '#6e6e6e';

  useFrame(() => {
    if (ref.current && typeof node.x === 'number' && !isNaN(node.x)) {
      ref.current.position.set(node.x, node.y, node.z!);
    }
  });

  const size = node.size || 8;
  const displaySize = hovered ? size * config.animation.highlight.scale_hover : (selected ? size * config.animation.highlight.scale_selected : size);

  return (
    <group ref={ref}>
      <Html
        transform
        sprite
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => onHover(true)}
          onPointerOut={() => onHover(false)}
          className={`
            relative flex items-center justify-center
            transition-opacity cursor-pointer pointer-events-auto
            ${dimmed ? 'opacity-30' : 'opacity-100'}
          `}
          style={{
            width: `${displaySize}px`,
            height: `${displaySize}px`,
            transitionDuration: `${config.animation.highlight.transition_duration}s`
          }}
        >
          <div
            className="w-full h-full transition-all"
            style={{
              transitionDuration: `${config.animation.highlight.transition_duration}s`,
              backgroundColor: color,
              borderRadius: config.graph.node_geometry?.shape === 'circle' ? '50%' : '0%',
              clipPath: config.graph.node_geometry?.shape === 'polygon'
                ? calculatePolygonClipPath(config.graph.node_geometry.polygon_sides || 6)
                : 'none',
              boxShadow: (hovered || selected) && config.graph.node_geometry?.shape === 'circle'
                ? `0 0 0 4px rgba(0,0,0,0.1), 0 0 10px ${color}`
                : 'none',
              filter: (hovered || selected) && config.graph.node_geometry?.shape === 'polygon'
                ? `drop-shadow(0 0 4px ${color})`
                : 'none'
            }}
          />
          <div
            className={`
              absolute top-full left-1/2 -translate-x-1/2 mt-2
              whitespace-nowrap text-[12px] font-medium tracking-wide text-neutral-800
              px-3 py-1 bg-white/90 rounded shadow-lg
              transition-all duration-200 pointer-events-none z-20
              ${hovered || selected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
          >
            {node.label}
          </div>
        </div>
      </Html>
    </group>
  );
};