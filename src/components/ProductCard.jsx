// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext'; // Import the hook

export default function ProductCard({ product }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { addToCart } = useCart(); // Now 'useCart' is defined

  // Helper to get the first price from the JSONB 'prices' object
  const getDisplayPrice = () => {
    if (!product.prices) return 'N/A';
    const firstPrice = Object.values(product.prices)[0];
    return `$${parseFloat(firstPrice).toFixed(2)}`;
  };

  return (
    <div className="flip-card">
      <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Card Front */}
        <div 
          className="flip-card-front" 
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${product.image_url || 'https://placehold.co/400x300/171717/FFFFFF?text=Image'}')` }}
        >
          <div className="mt-auto p-4">
            <h3 className="text-2xl font-bold text-center text-white font-display">{product.name}</h3>
          </div>
          <button onClick={() => setIsFlipped(true)} className="card-flipper">
            Details & Options
          </button>
        </div>

         {/* Card Back */}
        <div className="flip-card-back">
          <div className="p-4 flex flex-col flex-grow">
            {/* ... */}
            <div className="flex justify-between items-center w-full pt-4 mt-auto">
              <span className="text-2xl font-semibold text-emerald-400">{getDisplayPrice()}</span>
              {/* Update the button to add to cart */}
              <button
                onClick={() => addToCart(product, product.prices, product.options)}
                className="btn bg-emerald-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-emerald-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
          <button onClick={() => setIsFlipped(false)} className="card-flipper">
            Back to Image
          </button>
        </div>
      </div>
    </div>
  );
}