// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Header() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <header className="bg-black bg-opacity-70 backdrop-blur-sm sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-white">Doobie Division</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-lg font-semibold text-gray-200 hover:text-white px-1 transition-colors">Home</Link>
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name}`}
              className="text-lg font-semibold text-gray-200 hover:text-white px-1 transition-colors"
            >
              {category.name}
            </Link>
          ))}
          <Link to="/cart" className="text-lg font-semibold text-gray-200 hover:text-white px-1 transition-colors">Cart</Link>
        </nav>
      </div>
    </header>
  );
}