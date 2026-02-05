import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GalaxyGraph } from './components/GalaxyGraph';
import { GraphData, NodeData } from './types';
import { INITIAL_CAMERA_POSITION } from './constants';
import config from './data/config.json';

interface GraphSceneProps {
    data: GraphData;
    onNodeSelect: (node: NodeData | null) => void;
    selectedNodeId: string | null;
}

export const GraphScene: React.FC<GraphSceneProps> = ({ data, onNodeSelect, selectedNodeId }) => {
    return (
        <div className="w-full h-screen bg-transparent">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={INITIAL_CAMERA_POSITION as any} fov={60} near={0.1} far={2000} />

                <fog attach="fog" args={['#F8F4F1', 400, 1600]} />

                {/* Controls - Restricted to keep user inside the infinite cloud */}
                <OrbitControls
                    enablePan={config.controls.enablePan}
                    enableZoom={config.controls.enableZoom}
                    enableRotate={config.controls.enableRotate}
                    maxDistance={config.graph.camera_max_distance}
                    minDistance={config.graph.detail_view_distance}
                    minPolarAngle={config.controls.minPolarAngle}
                    maxPolarAngle={config.controls.maxPolarAngle}
                    minAzimuthAngle={config.controls.minAzimuthAngle === "Infinity" ? -Infinity : Number(config.controls.minAzimuthAngle)}
                    maxAzimuthAngle={config.controls.maxAzimuthAngle === "Infinity" ? Infinity : Number(config.controls.maxAzimuthAngle)}
                    zoomSpeed={0.6}
                    panSpeed={0.5}
                    rotateSpeed={0.5}
                    dampingFactor={0.1}
                />

                {/* Ambient Lighting */}
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Suspense fallback={null}>
                    <group>
                        <GalaxyGraph
                            data={data}
                            onNodeSelect={onNodeSelect}
                            selectedNodeId={selectedNodeId}
                        />
                    </group>
                </Suspense>
            </Canvas>
        </div>
    );
};
