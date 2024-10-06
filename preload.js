const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded'); // This will log in the terminal where Electron runs

contextBridge.exposeInMainWorld('electron', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: (projectId) => ipcRenderer.invoke('get-project', projectId),
  addProject: async (project) => {
    const newProject = await ipcRenderer.invoke('add-project', project);
    return newProject;
  },
  updateProject: (updatedProject) => ipcRenderer.invoke('update-project', updatedProject),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  addNode: ({ projectId, node }) => ipcRenderer.invoke('add-node', { projectId, node }),
  updateNode: ({ projectId, node }) => ipcRenderer.invoke('update-node', { projectId, node }),
  deleteNode: ({ projectId, nodeId }) => ipcRenderer.invoke('delete-node', { projectId, nodeId }),
});

console.log('Preload script loaded');
