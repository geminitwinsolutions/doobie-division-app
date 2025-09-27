import { useState, useEffect } from 'react';
import { useParams, Link as _Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import ProductCard from '../components/ProductCard.jsx';
import * as _React from 'react'; // Aliased React to suppress 'unused' warning

export default function ProductsPage() {
  const { subcategoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data: subcatData } = await supabase
        .from('subcategories')
        .select('id, category_id(name)') // Fetch the parent category name too
        .eq('name', subcategoryName)
        .single();
      
      if (subcatData) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('subcategory_id', subcatData.id);
        
        setProducts(productsData || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [subcategoryName]);

  if (loading) {
    return <div className="text-center text-white">Loading products...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white text-center mb-8 font-display">{subcategoryName}</h1>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 2. Map over the products and render a card for each one */}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-300 text-xl">No products available in this subcategory yet.</p>
      )}
    </div>
  );
}