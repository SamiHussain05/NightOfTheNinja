import React from 'react';
import ReactDOM from 'react-dom/client';  // Import the new API for React 18
import './index.css';  // Import global CSS styles
import App from './App';  // Import the main App component

// Creating the root and rendering the app inside the root element in index.html
const root = ReactDOM.createRoot(document.getElementById('root')); // Create the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);