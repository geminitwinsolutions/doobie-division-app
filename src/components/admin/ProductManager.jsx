// src/components/admin/ProductManager.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export default function ProductManager() {
  // Data state
  const [_products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for a new product
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [selectionType, setSelectionType] = useState('single');
  const [imageFile, setImageFile] = useState(null);
  
  // State for dynamic pricing fields
  const [prices, setPrices] = useState([{ label: 'default', value: '' }]);
  
  // State for selected options (strains, flavors, etc.)
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: productsData } = await supabase.from('products').select(`*, subcategories(name)`).order('created_at', { ascending: false });
    const { data: subcategoriesData } = await supabase.from('subcategories').select('*');
    const { data: optionsData } = await supabase.from('options').select('*');
    
    setProducts(productsData || []);
    setSubcategories(subcategoriesData || []);
    setOptions(optionsData || []);
    setLoading(false);
  };

  // Handlers for dynamic price fields
  const handlePriceChange = (index, field, value) => {
    const newPrices = [...prices];
    newPrices[index][field] = value;
    setPrices(newPrices);
  };

  const addPriceField = () => {
    setPrices([...prices, { label: '', value: '' }]);
  };

  // Handler for option checkboxes
  const handleOptionToggle = (optionId) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Handle Image Upload to Supabase Storage
    let imageUrl = null;
    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (error) {
        alert('Error uploading image: ' + error.message);
        return;
      }
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
      imageUrl = publicUrl;
    }
    
    // 2. Format prices into a JSON object
    const pricesObject = prices.reduce((obj, price) => {
      if (price.label && price.value) {
        obj[price.label] = parseFloat(price.value);
      }
      return obj;
    }, {});

    // 3. Prepare the final product payload
    const productPayload = {
      name,
      description,
      image_url: imageUrl,
      prices: pricesObject,
      subcategory_id: subcategoryId,
      selection_type: selectionType,
      is_active: true,
      options: selectedOptions // Pass the array of selected option UUIDs
    };

    // 4. Invoke the Edge Function
    const { error: invokeError } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'addProduct',
        payload: productPayload,
      },
    });

    if (invokeError) {
      alert('Error adding product: ' + invokeError.message);
    } else {
      alert('Product added successfully!');
      fetchData(); // Refresh data
      // Reset form fields
      setName('');
      setDescription('');
      setPrices([{ label: 'default', value: '' }]);
      setSelectedOptions([]);
      setImageFile(null);
    }
  };

  if (loading) return <p className="text-gray-400">Loading product data...</p>;

  return (
    <div>
      {/* Add Product Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg mb-8">
        {/* ... form fields ... */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Product Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Image</label>
          <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="input-file" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Subcategory</label>
          <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className="input-field" required>
            <option value="">Select a subcategory</option>
            {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Pricing</label>
          {prices.map((price, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <input type="text" placeholder="Label (e.g., 1g, Each)" value={price.label} onChange={(e) => handlePriceChange(index, 'label', e.target.value)} className="input-field w-1/2" />
              <input type="number" placeholder="Price" value={price.value} onChange={(e) => handlePriceChange(index, 'value', e.target.value)} className="input-field w-1/2" />
            </div>
          ))}
          {/* ** FIX IS HERE ** This button does not submit the form */}
          <button type="button" onClick={addPriceField} className="text-emerald-400 text-sm">+ Add Price Tier</button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Available Options (Strains, Flavors, etc.)</label>
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900 rounded-md max-h-48 overflow-y-auto">
            {options.map(opt => (
              <label key={opt.id} className="flex items-center space-x-2">
                <input type="checkbox" checked={selectedOptions.includes(opt.id)} onChange={() => handleOptionToggle(opt.id)} className="form-checkbox" />
                <span>{opt.name} ({opt.type})</span>
              </label>
            ))}
          </div>
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-300">Selection Type</label>
          <select value={selectionType} onChange={(e) => setSelectionType(e.target.value)} className="input-field">
            <option value="single">Single Choice (Radio Buttons)</option>
            <option value="split">Split Choice (Checkboxes)</option>
          </select>
        </div>
        {/* ** FIX IS HERE ** This button submits the form */}
        <button type="submit" className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">Add Product</button>
      </form>

      {/* Product List Table ... */}
    </div>
  );
}