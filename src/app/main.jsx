import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import '../tokens/tokens.css';
import './App.css';
import { hasVkLaunchParams, initVkMiniApp } from '../lib/vkMiniApp';

initVkMiniApp();

const Router = import.meta.env.VITE_ROUTER_MODE === 'hash' || hasVkLaunchParams()
  ? HashRouter
  : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
