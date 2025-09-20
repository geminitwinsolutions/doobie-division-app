// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { supabase } from '../lib/supabaseClient';

export default function Header() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // ... your data fetching logic ...
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <header className="bg-black bg-opacity-70 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto ...">
        {/* ... */}
        <nav className="hidden md:flex items-center space-x-4">
          {/* 2. Use the Link component with the correct path */}
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name}`}
              className="nav-link text-lg ..."
            >
              {category.name}
            </Link>
          ))}
          {/* ... */}
        </nav>
      </div>
    </header>
  );
}