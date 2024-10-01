const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Project Methods
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: (projectId) => ipcRenderer.invoke('get-project', projectId),
  addProject: (project) => ipcRenderer.invoke('add-project', project),
  updateProject: (updatedProject) => ipcRenderer.invoke('update-project', updatedProject),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  // Node Methods
  addNode: ({ projectId, node }) => ipcRenderer.invoke('add-node', { projectId, node }),
  updateNode: ({ projectId, node }) => ipcRenderer.invoke('update-node', { projectId, node }),
  deleteNode: ({ projectId, nodeId }) => ipcRenderer.invoke('delete-node', { projectId, nodeId }),
});

console.log('Preload script loaded');