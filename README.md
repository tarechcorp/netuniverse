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

## Configuration

You can customize the graph behavior by importing and modifying the default config:

```tsx
import { defaultConfig } from 'NetUniverse-explorer';

// Modify settings
const myConfig = {
  ...defaultConfig,
  graph: {
    ...defaultConfig.graph,
    network_node_count: 5000,
    connection_distance: 400,
  },
  controls: {
    ...defaultConfig.controls,
    enablePan: true,
    enableZoom: true,
  }
};
```

### Key Configuration Options

- **Graph**: Node count, spread, connection distance, colors
- **Animation**: Bounce physics, camera transitions, highlight scaling
- **Controls**: Zoom/Pan/Rotate toggles, axis locking

## API

### GraphScene Props

```typescript
interface GraphSceneProps {
  data: GraphData;                    // Graph data (nodes & links)
  onNodeSelect: (node: NodeData | null) => void;  // Node selection callback
  selectedNodeId: string | null;      // Currently selected node ID
}
```

### Types

```typescript
interface NodeData {
  id: string;
  label: string;
  cluster: string;
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
