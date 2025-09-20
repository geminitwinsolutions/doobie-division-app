// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductsPage from './pages/ProductsPage';
import AdminPage from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/products/:subcategoryName" element={<ProductsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;