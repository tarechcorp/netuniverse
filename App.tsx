import React, { useRef, useState } from 'react';
import { GraphScene } from './GraphScene';
import { OverlayUI } from './components/OverlayUI';
import { generateGraphData } from './data/generator';
import { NodeData, GraphRef } from './types';

// Generate data once outside component to avoid regeneration on render
const data = generateGraphData();

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const graphRef = useRef<GraphRef>(null);

  // Example: Navigate to specific coordinates
  const handleNavigate = (view: 'overview' | 'detail' | 'side') => {
    if (!graphRef.current) return;

    switch (view) {
      case 'overview':
        graphRef.current.flyTo([0, 0, 1000]);
        break;
      case 'detail':
        // Fly to the injected cube
        graphRef.current.flyTo([50, 50, 50], 2);
        // Look at it
        graphRef.current.lookAt([50, 50, 50], 2);
        break;
      case 'side':
        graphRef.current.flyTo([500, 200, 0]);
        graphRef.current.lookAt([0, 0, 0]);
        break;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 1. Spatial Background */}
      <GraphScene
        ref={graphRef}
        data={data}
        onNodeSelect={setSelectedNode}
        selectedNodeId={selectedNode?.id || null}
      >
        {/* 2. Injected 3D Content (Optional) */}
        {/* Children passed here will be rendered in the 3D scene */}
      </GraphScene>

      <OverlayUI selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />

      {/* 3. HTML Navigation Controls */}
      <div className="absolute bottom-8 left-8 flex space-x-4 z-20">
        <button
          onClick={() => handleNavigate('overview')}
          className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition backdrop-blur-md"
        >
          Overview
        </button>
        <button
          onClick={() => handleNavigate('side')}
          className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition backdrop-blur-md"
        >
          Side View
        </button>
      </div>
    </div>
  );
};

export default App;
