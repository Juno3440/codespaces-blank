import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from './NodeView.module.css';
import CustomNode from './CustomNode.js';
import { json } from '@codemirror/lang-json';
import { materialDark } from '@uiw/codemirror-theme-material';
import CodeMirror from '@uiw/react-codemirror';

const nodeTypes = { custom: CustomNode };

const NodeView = ({ project, onBack, onReturnToProjects }) => {
  const [jsonData, setJsonData] = useState('');
  const [nodes, setNodes] = useState(project.nodes || []);
  const [edges, setEdges] = useState(project.edges || []);

  useEffect(() => {
    // Optionally, you can perform other side effects here
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => nds.map((node) => ({ ...node, ...changes }))),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => eds.map((edge) => ({ ...edge, ...changes }))),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const parseJsonToNodesAndEdges = () => {
    try {
      const data = JSON.parse(jsonData);
      const newNodes = [];
      const newEdges = [];

      // Convert JSON data to nodes and edges
      let idCounter = 1;
      const traverse = (obj, parentId = null) => {
        const nodeId = `node-${idCounter++}`;
        newNodes.push({
          id: nodeId,
          type: 'custom',
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          data: { label: obj.name || 'Node', ...obj },
        });

        if (parentId) {
          newEdges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
          });
        }

        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach((child) => traverse(child, nodeId));
        }
      };

      traverse(data);

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      alert('Invalid JSON data');
      console.error('Invalid JSON:', error);
    }
  };

  const saveProjectUpdates = async () => {
    try {
      const updatedProject = {
        ...project,
        nodes,
        edges,
      };
      await window.electron.updateProject(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project.');
    }
  };

  const onLoad = (reactFlowInstance) => {
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
  };

  return (
    <div className={styles.nodeView}>
      <div className={styles.sidebar}>
        <button onClick={onBack} className={styles.button}>
          Back
        </button>
        <button onClick={onReturnToProjects} className={styles.button}>
          Return to Projects
        </button>
        <h2>JSON Input</h2>
        <CodeMirror
          value={jsonData}
          extensions={[json()]}
          theme={materialDark}
          onChange={(value) => setJsonData(value)}
          height="200px"
          className={styles.codeEditor}
        />
        <button onClick={parseJsonToNodesAndEdges} className={styles.button}>
          Generate Nodes
        </button>
        <button onClick={saveProjectUpdates} className={styles.button}>
          Save Project
        </button>
      </div>
      <div className={styles.reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          onLoad={onLoad} // ✅ Utilize onLoad instead
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default NodeView;