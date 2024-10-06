import React, { useEffect, useState } from 'react';
import styles from './ProjectsView.module.css';

function ProjectsView({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching projects...');
        const fetchedProjects = await window.electron.getProjects();
        console.log('Fetched projects:', fetchedProjects);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        alert('Failed to load projects.');
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    if (newProjectName.trim() === '') {
      alert('Project name cannot be empty.');
      return;
    }

    const newProject = {
      name: newProjectName,
      nodes: [],
      edges: [],
    };

    try {
      const savedProject = await window.electron.addProject(newProject);
      setProjects((prev) => [...prev, { ...newProject, id: savedProject.id }]);
      setNewProjectName('');
    } catch (error) {
      console.error('Failed to add project:', error);
      alert('Failed to add project.');
    }
  };

  return (
    <div className={styles.projectsView}>
      <h1>Projects</h1>
      <ul className={styles.projectList}>
        {projects.map((project) => (
          <li key={project.id} className={styles.projectItem}>
            <button onClick={() => onSelectProject(project.id)}>
              {project.name}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.addProjectContainer}>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New Project Name"
        />
        <button onClick={handleAddProject}>Add Project</button>
      </div>
    </div>
  );
}

export default ProjectsView;
