// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import supabase

export default function Header() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Function to fetch categories from Supabase
    const getCategories = async () => {
      const { data, error } = await supabase.from('categories').select('name');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    };

    getCategories();
  }, []);

  return (
    <header className="bg-black bg-opacity-70 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-white font-display">
          Doobie Division
        </a>
        <div className="hidden md:flex items-center space-x-4">
          {/* Map over the fetched categories to create links */}
          {categories.map((category) => (
            <a key={category.name} href={`/category/${category.name}`} className="text-lg text-gray-200 hover:text-white">
              {category.name}
            </a>
          ))}
        </div>
        {/* Add mobile menu and cart buttons here */}
      </nav>
    </header>
  );
}