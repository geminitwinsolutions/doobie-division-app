import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminDashboard({ user }) {
  // Data state
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Form input state
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductSubcategoryId, setNewProductSubcategoryId] = useState('');

  // Fetch all necessary admin data when the component loads
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch products, ordered by most recent
    const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productsError) console.error('Error fetching products:', productsError);
    else setProducts(productsData);

    // Fetch subcategories for the dropdown
    const { data: subcategoriesData, error: subcategoriesError } = await supabase.from('subcategories').select('id, name');
    if (subcategoriesError) console.error('Error fetching subcategories:', subcategoriesError);
    else setSubcategories(subcategoriesData);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductSubcategoryId) {
      alert('Please fill out all required fields.');
      return;
    }

    const newProduct = {
      name: newProductName,
      description: newProductDescription,
      prices: { "default": parseFloat(newProductPrice) },
      subcategory_id: newProductSubcategoryId,
      is_active: true,
    };

    const { error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'addProduct',
        payload: newProduct,
      },
    });

    if (error) {
      alert('Error adding product: ' + error.message);
    } else {
      alert('Product added successfully!');
      setNewProductName('');
      setNewProductDescription('');
      setNewProductPrice('');
      setNewProductSubcategoryId('');
      fetchData(); // Refresh the product list
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const { error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'deleteProduct',
        payload: { id: productId },
      },
    });

    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      alert('Product deleted successfully!');
      fetchData(); // Refresh the product list
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-300">Welcome, {user.email}</p>
      </div>

      {/* Add Product Form */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          />
          <textarea
            placeholder="Description"
            value={newProductDescription}
            onChange={(e) => setNewProductDescription(e.target.value)}
            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProductPrice}
            onChange={(e) => setNewProductPrice(e.target.value)}
            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          />
          <select
            value={newProductSubcategoryId}
            onChange={(e) => setNewProductSubcategoryId(e.target.value)}
            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Add Product
          </button>
        </form>
      </div>

      {/* Product List Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Existing Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 text-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Name</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Active</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border-b border-gray-600">{product.name}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{product.is_active ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b border-gray-600">
                    <button className="text-blue-400 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:underline ml-4">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;