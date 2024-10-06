import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import Store from 'electron-store';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Reconstruct __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Updated filename
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
    },
  });

  // **Update this URL to match Webpack Dev Server's port**
  mainWindow.loadURL('http://localhost:8081'); // Changed from 3000 to 8081

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// Handle all IPC events

// Get all projects
ipcMain.handle('get-projects', async () => {
  try {
    console.log('Fetching projects from store...');
    const projects = store.get('projects') || [];
    console.log('Projects fetched:', projects);
    console.log('Returning projects:', projects); // Log projects being returned
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
});

// Get a single project by ID
ipcMain.handle('get-project', async (event, projectId) => {
  try {
    const projects = store.get('projects') || [];
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  } catch (error) {
    console.error('Error fetching project:', error.message);
    throw error;
  }
});

// Add a new project
ipcMain.handle('add-project', async (event, project) => {
  try {
    const projects = store.get('projects') || [];
    const newProject = {
      ...project,
      id: nanoid(),
      nodes: [],
      edges: [],
    };
    projects.push(newProject);
    store.set('projects', projects);
    return newProject;
  } catch (error) {
    console.error('Error adding project:', error.message);
    throw error;
  }
});

// Update an existing project
ipcMain.handle('update-project', async (event, updatedProject) => {
  try {
    const projects = store.get('projects') || [];
    const index = projects.findIndex((p) => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      store.set('projects', projects);
      return updatedProject;
    }
    throw new Error('Project not found');
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
});

// Delete a project
ipcMain.handle('delete-project', async (event, projectId) => {
  try {
    const projects = store.get('projects') || [];
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    store.set('projects', updatedProjects);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
});

// Export a project as JSON
ipcMain.handle('export-project', async (event, projectId) => {
  try {
    const projects = store.get('projects') || [];
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Project',
      defaultPath: `${project.name}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (canceled || !filePath) {
      throw new Error('Export canceled');
    }

    fs.writeFileSync(filePath, JSON.stringify(project, null, 2));
    return filePath;
  } catch (error) {
    console.error('Error exporting project:', error);
    throw error;
  }
});

// Add a node to a project
ipcMain.handle('add-node', async (event, { projectId, node }) => {
  try {
    console.log(`Adding node to projectId: ${projectId}`);
    const projects = store.get('projects') || [];
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const newNode = { ...node, id: nanoid(), data: { ...node.data, checklist: node.data?.checklist || [] } };
    projects[projectIndex].nodes.push(newNode);
    store.set('projects', projects);
    console.log(`Node added successfully: ${JSON.stringify(newNode)}`);
    return newNode;
  } catch (error) {
    console.error('Error adding node:', error);
    throw new Error('Failed to add node');
  }
});

// Update a node in a project
ipcMain.handle('update-node', async (event, { projectId, node }) => {
  try {
    const projects = store.get('projects') || [];
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const nodeIndex = project.nodes.findIndex((n) => n.id === node.id);
    if (nodeIndex === -1) throw new Error('Node not found');

    // Ensure checklist is present
    node.data = { ...node.data, checklist: node.data?.checklist || [] };
    project.nodes[nodeIndex] = node;
    store.set('projects', projects);
    return node;
  } catch (error) {
    console.error('Error updating node:', error);
    throw new Error('Failed to update node');
  }
});

// Delete a node from a project
ipcMain.handle('delete-node', async (event, { projectId, nodeId }) => {
  try {
    const projects = store.get('projects') || [];
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    project.nodes = project.nodes.filter((n) => n.id !== nodeId);
    store.set('projects', projects);
    return true;
  } catch (error) {
    console.error('Error deleting node:', error);
    throw new Error('Failed to delete node');
  }
});

// ------------------------- Video Recording Handler -------------------------

// IPC handler to save video and associate it with a node
ipcMain.handle('save-video', async (event, arrayBuffer, nodeId) => {
  try {
    // Generate default file name using nodeId and timestamp
    const defaultPath = `devlog_node_${nodeId}_${Date.now()}.webm`;

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Video',
      defaultPath,
      filters: [{ name: 'WebM Video', extensions: ['webm'] }],
    });

    if (canceled || !filePath) {
      throw new Error('Save canceled');
    }

    // Save the video file
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    console.log(`Video saved at ${filePath}`);

    // Associate the saved video with the corresponding node
    const projects = store.get('projects') || [];
    let nodeFound = false;

    for (let project of projects) {
      const node = project.nodes.find((n) => n.id === nodeId);
      if (node) {
        node.videoLog = filePath;
        nodeFound = true;
        break;
      }
    }

    if (!nodeFound) {
      throw new Error('Node not found for associating video');
    }

    // Save the updated projects back to the store
    store.set('projects', projects);

    return filePath;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
});

// ------------------------- Devlogs Handlers -------------------------

// Get all devlogs (if applicable, based on your app's logic)
ipcMain.handle('get-devlogs', async () => {
  try {
    // Assuming devlogs are part of projects' nodes
    const projects = store.get('projects') || [];
    const devlogs = [];

    projects.forEach((project) => {
      project.nodes.forEach((node) => {
        if (node.videoLog) {
          devlogs.push({
            projectId: project.id,
            projectName: project.name,
            nodeId: node.id,
            nodeTitle: node.title,
            videoLog: node.videoLog,
          });
        }
      });
    });

    return devlogs;
  } catch (error) {
    console.error('Error fetching devlogs:', error);
    throw new Error('Failed to fetch devlogs');
  }
});

// ------------------------- Additional IPC Handlers -------------------------
// You can add more IPC handlers here as needed, such as handling text notes, exporting data, etc.

/**
 * Ensure to export the mainWindow or other necessary objects if required for other functionalities.
 * For example, if you want to open other windows or perform actions outside of IPC.
 */

const saveProjectUpdates = async (updatedNodes, updatedEdges) => {
  try {
    const updatedProject = {
      id: projectId,
      nodes: updatedNodes,
      edges: updatedEdges,
      // Include other project fields as necessary
    };
    await window.electron.updateProject(updatedProject);
    console.log('Project updated successfully.');
  } catch (error) {
    console.error('Error updating project:', error);
    alert('Failed to update project.');
  }
};
