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
import dagre from 'dagre';

const NodeView = ({ project, onBack, onReturnToProjects }) => {
  const [jsonData, setJsonData] = useState('');
  const [nodes, setNodes] = useState(project.nodes || []);
  const [edges, setEdges] = useState(project.edges || []);

  useEffect(() => {
    // Placeholder for any side effects or subscriptions
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

  // Handler to toggle task completion
  const handleToggleTask = (nodeId, taskIndex) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedChecklist = node.data.checklist.map((task, index) => {
            if (index === taskIndex) {
              return { ...task, completed: !task.completed };
            }
            return task;
          });
          return {
            ...node,
            data: {
              ...node.data,
              checklist: updatedChecklist,
            },
          };
        }
        return node;
      })
    );
  };

  const nodeTypes = {
    custom: (nodeProps) => <CustomNode {...nodeProps} onToggleTask={handleToggleTask} />,
  };

  const parseJsonToNodesAndEdges = () => {
    try {
      const data = JSON.parse(jsonData);
      const newNodes = [];
      const newEdges = [];

      data.forEach((obj) => {
        newNodes.push({
          id: obj.id,
          type: 'custom',
          position: obj.position || { x: Math.random() * 1000, y: Math.random() * 1000 }, // Increased range
          data: { 
            label: obj.name || 'Node', 
            textNotes: obj.textNotes, 
            checklist: obj.checklist 
          },
        });
      });

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

  // Move DAGRE layout logic inside useEffect to prevent infinite re-renders
  useEffect(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 172;
    const nodeHeight = 36;
    dagreGraph.setGraph({ rankdir: 'LR' });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const updatedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    setNodes(updatedNodes);
    // Note: If edges also need to be updated based on the layout, handle accordingly.
  }, [nodes.length, edges.length]); // Dependencies to trigger layout when nodes or edges change

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
          onLoad={onLoad}
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