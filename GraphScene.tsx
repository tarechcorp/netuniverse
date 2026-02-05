import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { GalaxyGraph } from './components/GalaxyGraph';
import { GraphData, NodeData, GraphRef } from './types';
import { INITIAL_CAMERA_POSITION } from './constants';
import config from './data/config.json';



export interface GraphSceneProps {
    data: GraphData;
    onNodeSelect?: (node: NodeData | null) => void;
    selectedNodeId?: string | null;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const GraphScene = React.forwardRef<GraphRef, GraphSceneProps>(({
    data,
    onNodeSelect = () => { },
    selectedNodeId = null,
    children,
    className,
    style
}, ref) => {
    const controlsRef = React.useRef<any>(null);
    const cameraRef = React.useRef<THREE.PerspectiveCamera>(null);

    React.useImperativeHandle(ref, () => ({
        camera: cameraRef.current!,
        flyTo: (position: [number, number, number], duration = 1.5) => {
            if (!cameraRef.current || !controlsRef.current) return;

            // Animate camera position
            gsap.to(cameraRef.current.position, {
                x: position[0],
                y: position[1],
                z: position[2],
                duration: duration,
                ease: "power2.inOut",
                onUpdate: () => controlsRef.current.update()
            });
        },
        lookAt: (target: [number, number, number], duration = 1.5) => {
            if (!controlsRef.current) return;

            // Animate controls target
            gsap.to(controlsRef.current.target, {
                x: target[0],
                y: target[1],
                z: target[2],
                duration: duration,
                ease: "power2.inOut",
                onUpdate: () => controlsRef.current.update()
            });
        }
    }));

    return (
        <div className={`w-full h-full bg-transparent ${className || ''}`} style={style}>
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera
                    ref={cameraRef}
                    makeDefault
                    position={INITIAL_CAMERA_POSITION as any}
                    fov={60}
                    near={0.1}
                    far={2000}
                />

                <color attach="background" args={[config.graph.colors.background]} />
                <fog attach="fog" args={[config.graph.colors.background, 400, 1600]} />

                {/* Controls - Restricted to keep user inside the infinite cloud */}
                <OrbitControls
                    ref={controlsRef}
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
                        {/* 3D Content Injection */}
                        {children}
                    </group>
                </Suspense>
            </Canvas>
        </div>
    );
});
