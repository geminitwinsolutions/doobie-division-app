// src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ProductsPage() {
  const { subcategoryName } = useParams(); // Get the subcategory name from the URL
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      // First, get the subcategory id
      const { data: subcatData } = await supabase
        .from('subcategories')
        .select('id')
        .eq('name', subcategoryName)
        .single();
      
      if (subcatData) {
        // Then, fetch all products with that subcategory id
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('subcategory_id', subcatData.id);
        
        if (productsData) setProducts(productsData);
      }
    };

    fetchProducts();
  }, [subcategoryName]); // Re-run when the subcategoryName changes

  return (
    <div>
      <h1 className="text-4xl font-bold text-white text-center mb-8">{subcategoryName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800 p-4 rounded-lg">
            <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded"/>
            <h3 className="text-xl text-white font-bold mt-2">{product.name}</h3>
            {/* Access the first price from the jsonb column */}
            <p className="text-2xl text-emerald-400 font-semibold">
              ${product.prices ? Object.values(product.prices)[0] : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}