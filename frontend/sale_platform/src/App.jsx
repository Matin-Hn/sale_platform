import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductsPage from './pages/ProductsPage.jsx';

console.log('App.jsx loaded'); // برای دیباگ

const App = () => {
  return (
    <div>
      <ProductsPage />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error('Root element not found');
}