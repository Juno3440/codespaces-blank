import React, { useState, useEffect } from 'react';
import styles from './FileExplorer.module.css';

function FileExplorer({ devlogs, refreshDevlogs, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const proj = await window.electron.getProjects();
    setProjects(proj);
  };

  const handleAddProject = async () => {
    if (newProjectName.trim() === '') return;
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName,
      nodes: [],
    };
    await window.electron.addProject(newProject);
    setNewProjectName('');
    loadProjects();
  };

  return (
    <div className={styles.fileExplorer}>
      <h2 className={styles.title}>Projects</h2>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.id} className={styles.listItem}>
            <button
              className={styles.devlogButton}
              onClick={() => onSelectProject(project.id)}
            >
              {project.name}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.addProject}>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New Project"
          className={styles.input}
        />
        <button onClick={handleAddProject} className="button">Add</button>
      </div>
    </div>
  );
}

export default FileExplorer;