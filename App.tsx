import React, { useState, useMemo } from 'react';
import { GraphScene } from './GraphScene';
import { OverlayUI } from './components/OverlayUI';
import { generateGraphData } from './data/generator';
import { NodeData } from './types';

const App: React.FC = () => {
  // Generate data once
  // Generate data once
  const data = useMemo(() => {
    try {
      return generateGraphData();
    } catch (e) {
      console.error("Failed to generate graph data:", e);
      return { nodes: [], links: [] };
    }
  }, []);

  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const handleNodeSelect = (node: NodeData | null) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div className="relative w-full h-full">
      <GraphScene
        data={data}
        onNodeSelect={handleNodeSelect}
        selectedNodeId={selectedNode?.id || null}
      />
      <OverlayUI
        selectedNode={selectedNode}
        onClose={handleClosePanel}
      />
    </div>
  );
};

export default App;
