// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Import the new Layout
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductsPage from './pages/ProductsPage';
import AdminPage from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes inside here will share the Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path="products/:subcategoryName" element={<ProductsPage />} />
          {/* Add an InfoPage route here later */}
        </Route>

        {/* The Admin page has its own layout */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;