// src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function CategoryPage() {
  const { categoryName } = useParams(); // Get the category name from the URL
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      // 1. Get the ID of the current category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (categoryData) {
        // 2. Get all subcategories that belong to that category ID
        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('name, description')
          .eq('category_id', categoryData.id);
        
        if (subcategoryData) {
          setSubcategories(subcategoryData);
        }
      }
    };

    fetchSubcategories();
  }, [categoryName]); // Re-run this when the category changes

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 font-display">{categoryName}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {subcategories.map((sub) => (
          <Link 
            key={sub.name}
            to={`/products/${sub.name}`} 
            className="w-full text-left p-6 bg-black bg-opacity-70 backdrop-blur-sm text-white rounded-xl shadow-lg border border-white/20 hover:border-emerald-400 transition-all"
          >
            <h3 className="text-2xl font-bold">{sub.name}</h3>
            <p className="text-sm font-medium opacity-80 mt-2">{sub.description || 'Explore Products'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}