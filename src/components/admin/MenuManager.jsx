import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export default function MenuManager() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding new items
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');

  // State for editing an item
  const [editingItem, setEditingItem] = useState(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select(`id, name, subcategories (id, name, description, category_id)`);

    if (error) console.error("Error fetching menu data:", error);
    else setMenuData(data || []);
    setLoading(false);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addCategory', payload: { name: newCategoryName } },
    });
    if (error) globalThis.alert(error.message); // <-- Standardized
    else {
      globalThis.alert('Category added!'); // <-- Standardized
      setNewCategoryName('');
      fetchMenuData();
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addSubcategory', payload: { name: newSubcategoryName, category_id: parentCategoryId } },
    });
    if (error) globalThis.alert(error.message); // <-- Standardized
    else {
      globalThis.alert('Subcategory added!'); // <-- Standardized
      setNewSubcategoryName('');
      setParentCategoryId('');
      fetchMenuData();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditedName(item.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem || !editedName) return;

    const action = editingItem.category_id ? 'updateSubcategory' : 'updateCategory';
    
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: action,
        payload: { id: editingItem.id, name: editedName },
      },
    });

    if (error) globalThis.alert(error.message); // <-- Standardized
    else {
      globalThis.alert('Item updated successfully!'); // <-- Standardized
      setEditingItem(null);
      setEditedName('');
      fetchMenuData();
    }
  };

  const handleDelete = async (item) => {
    const isCategory = !item.category_id;
    const itemType = isCategory ? 'category' : 'subcategory';
    
    if (!globalThis.confirm(`Are you sure you want to delete this ${itemType}: "${item.name}"? This cannot be undone.`)) return; // <-- Standardized

    const action = isCategory ? 'deleteCategory' : 'deleteSubcategory';

    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action, payload: { id: item.id } },
    });

    if (error) globalThis.alert(error.message); // <-- Standardized
    else {
      globalThis.alert(`${itemType} deleted successfully!`); // <-- Standardized
      fetchMenuData();
    }
  };

  if (loading) return <p className="text-gray-400">Loading menu structure...</p>;

  return (
    <div>
      {/* Edit Form Modal (simplified) */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <form onSubmit={handleUpdate} className="space-y-4 bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-white">Edit: {editingItem.name}</h3>
            <input 
              type="text" 
              value={editedName} 
              onChange={(e) => setEditedName(e.target.value)} 
              className="input-field w-full" 
              required 
            />
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Save Changes</button>
              <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

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
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-bold text-emerald-400">{category.name}</h4>
              <div>
                <button type="button" onClick={() => handleEdit(category)} className="text-blue-400 hover:text-blue-200 text-sm mr-4">Edit</button>
                <button type="button" onClick={() => handleDelete(category)} className="text-red-400 hover:text-red-200 text-sm">Delete</button>
              </div>
            </div>
            <div className="pl-4 mt-2 space-y-2">
              {category.subcategories.map(sub => (
                <div key={sub.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <p>{sub.name}</p>
                  <div>
                    <button type="button" onClick={() => handleEdit(sub)} className="text-blue-400 hover:text-blue-200 text-sm mr-4">Edit</button>
                    <button type="button" onClick={() => handleDelete(sub)} className="text-red-400 hover:text-red-200 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}