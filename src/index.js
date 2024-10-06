import React from 'react';
import ReactDOM from 'react-dom/client';
let logMessage;
if (typeof window === 'undefined') {
  // Only require logger.cjs in a Node.js environment
  ({ logMessage } = require('../logger.cjs'));
} else {
  // Provide a no-op function for the browser environment
  logMessage = () => {};
}
import App from './App.js'; // Add the .js extension
import './styles/global.css';

try {
  console.log('Initializing React app');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error during rendering:', error);
  alert('An error occurred during rendering: ' + error.message);
}
