import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [productName, setProductName] = useState('');

  // Check for a logged-in user when the page loads
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setUser(data.user);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName) {
      alert('Product name is required');
      return;
    }

    const { data, error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'addProduct',
        payload: { name: productName, is_active: true /* Add other fields here */ },
      },
    });

    if (error) {
      alert('Error adding product: ' + error.message);
    } else {
      alert('Product added successfully!');
      setProductName(''); // Clear the form
    }
  };

  // If no user is logged in, show the login form
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <form onSubmit={handleLogin} className="mt-4 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Log In
          </button>
        </form>
      </div>
    );
  }

  // If user is logged in, show the admin panel
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p>Welcome, {user.email}</p>
      
      <form onSubmit={handleAddProduct} className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Add New Product</h2>
        <input
          type="text"
          placeholder="New Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {/* Add more inputs for price, description, etc. here */}
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
          Add Product
        </button>
      </form>
    </div>
  );
}