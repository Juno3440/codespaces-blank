import React, { useEffect, useState, useRef } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import styles from './Timeline.module.css';

function Timeline({ projectId, onBack, onReturnToProjects }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    loadNodes();
  }, [projectId]);

  const loadNodes = async () => {
    try {
      if (!window.electron || typeof window.electron.getProject !== 'function') {
        console.error('window.electron.getProject is not defined');
        alert('Failed to load project: Electron API not available.');
        return;
      }

      console.log('Fetching project with ID:', projectId);
      const project = await window.electron.getProject(projectId);
      console.log('Fetched project:', project);

      if (!project) {
        console.error('No project found for projectId:', projectId);
        alert('Failed to load project: Project not found.');
        return;
      }

      if (!Array.isArray(project.nodes) || !Array.isArray(project.edges)) {
        console.error('Project data is missing nodes or edges:', project);
        alert('Failed to load project: Invalid project data.');
        return;
      }

      setNodes(project.nodes);
      setEdges(project.edges);
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project.');
    }
  };

  return (
    <div className={styles.timeline}>
      {error && <div className={styles.error}>{error}</div>}
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
      <button onClick={onReturnToProjects} className={styles.returnButton}>
        Return to Projects
      </button>
      {/* Rest of your Timeline component */}
    </div>
  );
}

export default Timeline;