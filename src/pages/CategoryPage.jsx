import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [items, setItems] = useState([]); // Will hold either categories or subcategories
  const [isAllCategories, setIsAllCategories] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (categoryName === 'all') {
        setIsAllCategories(true);
        // Fetch all main categories
        const { data, error } = await supabase.from('categories').select('name');
        if (error) console.error('Error fetching all categories:', error);
        else setItems(data || []);
      } else {
        setIsAllCategories(false);
        // Fetch subcategories for a specific category
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (categoryData) {
          const { data: subcategoryData } = await supabase
            .from('subcategories')
            .select('name, description')
            .eq('category_id', categoryData.id);
          
          if (subcategoryData) setItems(subcategoryData);
        }
      }
    };

    fetchData();
  }, [categoryName]);

  const pageTitle = categoryName === 'all' ? 'All Categories' : categoryName;

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 font-display">{pageTitle}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => {
          // Render links differently based on whether we're showing categories or subcategories
          const linkTo = isAllCategories ? `/category/${item.name}` : `/products/${item.name}`;
          
          return (
            <Link 
              key={item.name}
              to={linkTo} 
              className="w-full text-left p-6 bg-black bg-opacity-70 backdrop-blur-sm text-white rounded-xl shadow-lg border border-white/20 hover:border-emerald-400 transition-all"
            >
              <h3 className="text-2xl font-bold">{item.name}</h3>
              {item.description && (
                <p className="text-sm font-medium opacity-80 mt-2">{item.description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}