import React, { useEffect, useState } from 'react';
import styles from './NodeDetails.module.css';
import { json } from '@codemirror/lang-json';
import { materialDark } from '@uiw/codemirror-theme-material';
import { CodeMirror } from '@uiw/react-codemirror';
import dagre from 'dagre';

function NodeDetails({ projectId, nodeId, closeDetails, refreshNode }) {
  const [node, setNode] = useState(null);
  const [videoLog, setVideoLog] = useState(null);
  const [textNotes, setTextNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    loadNode();
  }, [projectId, nodeId]);

  const loadNode = async () => {
    try {
      console.log('Fetching project with ID:', projectId);
      const project = await window.electron.getProject(projectId);
      console.log('Fetched project:', project);
      if (project) {
        const currentNode = project.nodes.find((n) => n.id === nodeId);
        console.log('Fetched node:', currentNode);
        setNode(currentNode);
        setVideoLog(currentNode.videoLog || null);
        setTextNotes(currentNode.textNotes || '');
        setChecklist(currentNode.checklist || []);
      }
    } catch (error) {
      console.error('Error loading node:', error);
      alert('Failed to load node.');
    }
  };

  const handleSave = async () => {
    try {
      const updatedNode = { ...node, textNotes, checklist };
      await window.electron.updateNode({ projectId, node: updatedNode });
      refreshNode(); // Refresh the node in Timeline
      closeDetails();
    } catch (error) {
      console.error('Error saving node:', error);
      alert('Failed to save node.');
    }
  };

  const handleDelete = async () => {
    try {
      await window.electron.deleteNode({ projectId, nodeId: node.id });
      closeDetails();
    } catch (error) {
      console.error('Error deleting node:', error);
      alert('Failed to delete node.');
    }
  };

  const handleNewDevlog = (newDevlog) => {
    console.log('New Devlog:', newDevlog);
  };

  const toggleTaskCompletion = (index) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setChecklist(updatedChecklist);
  };

  const addTask = () => {
    if (newTask.trim() === '') return;
    setChecklist([...checklist, { task: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const removeTask = (index) => {
    const updatedChecklist = [...checklist];
    updatedChecklist.splice(index, 1);
    setChecklist(updatedChecklist);
  };

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
    <div className={styles.nodeDetails}>
      {node && (
        <>
          <h2>{node.title}</h2>
          <p>{node.description}</p>
          <h3>Text Notes</h3>
          <CodeMirror
            value={textNotes}
            extensions={[json()]}
            theme={materialDark}
            onChange={(value) => setTextNotes(value)}
            height="150px"
            className={styles.codeEditor}
          />
          <h3>Checklist</h3>
          <ul className={styles.checklist}>
            {checklist.map((task, index) => (
              <li key={index} className={task.completed ? styles.completed : ''}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(index)}
                />
                {task.task}
                <button onClick={() => removeTask(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New Task"
          />
          <button onClick={addTask}>Add Task</button>
          <div className={styles.actions}>
            <button onClick={handleSave} className={styles.saveButton}>Save</button>
            <button onClick={closeDetails} className={styles.cancelButton}>Cancel</button>
            <button onClick={handleDelete} className={styles.deleteButton}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default NodeDetails;