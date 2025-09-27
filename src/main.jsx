// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CartProvider } from './contexts/CartContext.jsx'; // Import the provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> {/* Wrap the App with the CartProvider */}
      <App />
    </CartProvider>
  </React.StrictMode>
);