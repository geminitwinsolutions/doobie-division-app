// src/pages/CartPage.jsx
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabaseClient';

export default function CartPage() {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      name,
      address,
      items: cart.map(item => ({
        name: item.product.name,
        options: item.selectedOptions,
        quantity: item.quantity,
        price: item.displayPrice
      }))
    };

    // Invoke the Supabase Edge Function
    const { error } = await supabase.functions.invoke('process-telegram-order', {
      body: { payload: orderPayload }
    });

    setIsSubmitting(false);

    if (error) {
      alert("There was an error submitting your order. Please try again.");
      console.error(error);
    } else {
      alert("Order submitted! You will be contacted via Telegram shortly.");
      clearCart();
    }
  };

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-400">Your cart is empty.</p>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <ul className="space-y-4 mb-6">
            {cart.map(item => (
              <li key={item.cartId} className="flex justify-between items-center bg-gray-900 p-4 rounded-md">
                <span>{item.quantity} x {item.product.name}</span>
                <span>${(item.displayPrice * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              required
            />
            <textarea
              placeholder="Your Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field w-full"
              rows="3"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order via Telegram'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}