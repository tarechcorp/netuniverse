# NetUniverse Explorer

A beautiful 3D graph visualization library for React built with Three.js and React Three Fiber.

![Network Universe](https://img.shields.io/badge/version-1.0.0-blue.svg)

## Features

- 🌌 **3D Network Visualization**: Immersive particle-based graph rendering with 4000+ background nodes
- ⚡ **Physics Simulation**: Cosmos force-directed layout for main nodes
- 🎨 **Interactive Animations**: 
  - Grab interaction (hover to connect)
  - Color shift on click (customizable)
  - Smooth camera transitions
- ⚙️ **Fully Configurable**: Control colors, distances, animations, and camera behavior via `config.json`
- 📦 **TypeScript Support**: Full type definitions included
- 🎯 **Zero Dependencies Bundled**: Peer dependencies for minimal bundle size

## Installation

```bash
npm install netuniverse
# or
yarn add netuniverse
```

### Peer Dependencies

You must install these alongside the library:

```bash
npm install react react-dom three
```

## Usage

### Basic Example

```tsx
import { GraphScene } from 'netuniverse';
import type { GraphData } from 'netuniverse';

const data: GraphData = {
  nodes: [
    { id: '1', label: 'Node 1', cluster: 'CORE', x: 0, y: 0, z: 0 },
    { id: '2', label: 'Node 2', cluster: 'FINANCE', x: 100, y: 0, z: 0 },
  ],
  links: [
    { source: '1', target: '2' }
  ]
};

function App() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GraphScene
        data={data}
        onNodeSelect={setSelectedNode}
        selectedNodeId={selectedNode?.id || null}
      />
    </div>
  );
}
```

### Next.js Usage

```tsx
'use client';
import dynamic from 'next/dynamic';

const GraphScene = dynamic(
  () => import('NetUniverse-explorer').then(mod => ({ default: mod.GraphScene })),
  { ssr: false }
);

export default function Page() {
  // ... same as above
}
```

### Spatial API (Background Mode)

You can turn the graph into an interactive spatial background by injecting your own 3D content and controlling the camera programmatically.

```tsx
import { useRef } from 'react';
import { GraphScene, GraphRef } from 'netuniverse';

function MySpatialPage() {
  const graphRef = useRef<GraphRef>(null);

  const handleScrollToFeature = () => {
    // Fly to coordinates [x, y, z] to show a specific 3D feature
    graphRef.current?.flyTo([50, 50, 50], 2);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 1. Spatial Background */}
      <GraphScene ref={graphRef} data={data}>
        {/* 2. Inject Custom 3D Content */}
        <mesh position={[50, 50, 50]}>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="orange" wireframe />
        </mesh>
      </GraphScene>

      {/* 3. HTML Overlay */}
      <div style={{ position: 'absolute', zIndex: 10 }}>
        <button onClick={handleScrollToFeature}>Go to Feature</button>
      </div>
    </div>
  );
}
```

### GraphRef API

The `ref` passed to `GraphScene` exposes the following methods for programmatic control:

```typescript
interface GraphRef {
  /** The underlying Three.js camera instance */
  camera: THREE.PerspectiveCamera;
  
  /**
   * Smoothly fly the camera to a specific 3D position.
   * @param position [x, y, z] coordinates
   * @param duration Animation duration in seconds (default: 1.5)
   */
  flyTo: (position: [number, number, number], duration?: number) => void;

  /**
   * Smoothly rotate the camera to look at a specific target point.
   * @param target [x, y, z] coordinates to look at
   * @param duration Animation duration in seconds (default: 1.5)
   */
  lookAt: (target: [number, number, number], duration?: number) => void;
}
```

### Types

```typescript
export enum ClusterId {
  Core = 'CORE',
  Finance = 'FINANCE',
  Social = 'SOCIAL',
  Infrastructure = 'INFRA',
  Network = 'NETWORK'
}

interface NodeData {
  id: string;
  label: string;
  cluster: ClusterId | string;
  x?: number;
  y?: number;
  z?: number;
  size?: number;
  description?: string;
  connections?: string[];
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
}

interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}
```

## Advanced Usage

### Injecting 3D Content (Spatial Background)

`GraphScene` acts as a 3D container. specific 3D objects can be injected directly as children, allowing you to mix the graph visualization with other Three.js elements.

```tsx
<GraphScene data={data}>
  <mesh position={[50, 50, 50]}>
    <boxGeometry args={[10, 10, 10]} />
    <meshStandardMaterial color="orange" wireframe />
  </mesh>
</GraphScene>
```

### Custom Physics Hook

If you need access to the underlying d3-force simulation, you can use the exported `useGraphPhysics` hook, though standard usage handles this automatically within `GalaxyGraph`.

```tsx
import { useGraphPhysics } from 'netuniverse';

// Inside a component within the <Canvas> context
useGraphPhysics({ nodes, links });
```

## Configuration

You can customize the graph behavior by importing and modifying the default config.

### Full Options Reference

| Section | Key | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Graph** | `network_node_count` | Int | `4000` | Number of background star particles. |
| | `network_spread` | Int | `1500` | Spatial spread of the background cloud. |
| | `connection_distance` | Int | `300` | Max distance for background lines. |
| | `grab_distance` | Int | `300` | Radius for mouse interaction grab effect. |
| **Colors** | `background` | Hex | `#FFFBF4` | Scene background & fog color. |
| | `network_node` | Hex | `#BDC3C7` | Color of background nodes. |
| | `click_active` | Hex | `#E47600` | Flash color on interaction. |
| **Controls** | `enableZoom` | Bool | `true` | Allow zooming. |
| | `enableRotate` | Bool | `true` | Allow rotation. |
| | `maxPolarAngle` | Float | `3.14159` | Vertical rotation limit. |
| **Animation** | `bounce.enabled` | Bool | `true` | Enable boundary bounce effect. |
| | `highlight.scale_hover` | Float | `1.5` | Scale factor on hover. |

```tsx
import { defaultConfig } from 'netuniverse';

const myConfig = {
  ...defaultConfig,
  graph: {
    ...defaultConfig.graph,
    colors: {
        ...defaultConfig.graph.colors,
        background: '#0f172a',
    }
  }
};
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build library
npm run build
```

## License

MIT

## Credits

Built with:
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei](https://github.com/pmndrs/drei)
- [d3-force-3d](https://github.com/vasturiano/d3-force-3d)
- [GSAP](https://greensock.com/gsap/)
