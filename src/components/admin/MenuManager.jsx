import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function MenuManager() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setLoading(true);
    // Fetch categories and their nested subcategories in one go
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        subcategories (id, name, description)
      `);

    if (error) console.error("Error fetching menu data:", error);
    else setMenuData(data || []);
    setLoading(false);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addCategory', payload: { name: newCategoryName } },
    });
    if (error) alert(error.message);
    else {
      alert('Category added!');
      setNewCategoryName('');
      fetchMenuData();
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addSubcategory', payload: { name: newSubcategoryName, category_id: parentCategoryId } },
    });
    if (error) alert(error.message);
    else {
      alert('Subcategory added!');
      setNewSubcategoryName('');
      setParentCategoryId('');
      fetchMenuData();
    }
  };

  if (loading) return <p className="text-gray-400">Loading menu structure...</p>;

  return (
    <div>
      {/* Add Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <form onSubmit={handleAddCategory} className="space-y-4 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Add New Main Category</h3>
          <input type="text" placeholder="Category Name (e.g., Promos)" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="input-field w-full" />
          <button type="submit" className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700">Add Category</button>
        </form>
        <form onSubmit={handleAddSubcategory} className="space-y-4 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Add New Subcategory</h3>
          <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} className="input-field w-full">
            <option value="">Select Parent Category</option>
            {menuData.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="text" placeholder="Subcategory Name (e.g., Specials)" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} className="input-field w-full" />
          <button type="submit" className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700">Add Subcategory</button>
        </form>
      </div>

      {/* Display Menu Structure */}
      <div className="space-y-6">
        {menuData.map(category => (
          <div key={category.id} className="bg-gray-900 p-4 rounded-md">
            <h4 className="text-lg font-bold text-emerald-400">{category.name}</h4>
            <div className="pl-4 mt-2 space-y-2">
              {category.subcategories.map(sub => (
                <div key={sub.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <p>{sub.name}</p>
                  {/* Add delete/edit buttons here */}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}