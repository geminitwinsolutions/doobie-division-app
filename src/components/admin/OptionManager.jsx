import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

// A new sub-component to manage the list of Option Types
function TypeManager({ types, onAdd, onDelete, fetchTypes }) {
  const [newTypeName, setNewTypeName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    onAdd(newTypeName);
    setNewTypeName('');
    fetchTypes(); // Refetch types after adding
  };

  return (
    <div className="space-y-4 bg-gray-900 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white">Manage Option Types</h3>
      {/* Form to add a new type */}
      <form onSubmit={handleAdd} className="flex gap-4">
        <input
          type="text"
          placeholder="New Type Name (e.g., Effect)"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          className="input-field flex-grow"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm">
          Add Type
        </button>
      </form>
      {/* List of existing types */}
      <div className="space-y-2">
        {types.map(type => (
          <div key={type.id} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
            <span>{type.name}</span>
            <button type="button" onClick={() => onDelete(type.id, type.name)} className="text-red-400 hover:underline text-xs">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OptionManager() {
  const [options, setOptions] = useState([]);
  const [optionTypes, setOptionTypes] = useState([]); // State for the types
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newTypeId, setNewTypeId] = useState(''); // Changed from newType to newTypeId

  useEffect(() => {
    // Fetch all data on component mount
    const initialFetch = async () => {
      setLoading(true);
      await Promise.all([fetchOptions(), fetchOptionTypes()]);
      setLoading(false);
    };
    initialFetch();
  }, []);

  const fetchOptions = async () => {
    // Fetch options and join with the option_types table to get the type name
    const { data, error } = await supabase
      .from('options')
      .select(`id, name, option_types ( name )`)
      .order('name');
      
    if (error) console.error("Error fetching options:", error);
    else setOptions(data || []);
  };

  const fetchOptionTypes = async () => {
    const { data, error } = await supabase.from('option_types').select('*').order('name');
    if (error) console.error("Error fetching option types:", error);
    else setOptionTypes(data || []);
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newName || !newTypeId) {
      alert('Please provide both a name and a type.');
      return;
    }
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addOption', payload: { name: newName, type_id: newTypeId } }, // Pass type_id
    });
    if (error) {
      alert('Error adding option: ' + error.message);
    } else {
      alert(`Option "${newName}" added successfully!`);
      setNewName('');
      setNewTypeId('');
      fetchOptions();
    }
  };

  const handleDeleteOption = async (optionId, optionName) => {
    if (!globalThis.confirm(`Are you sure you want to delete "${optionName}"?`)) return;
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'deleteOption', payload: { id: optionId } },
    });
    if (error) alert('Error deleting option: ' + error.message);
    else {
      alert('Option deleted successfully!');
      fetchOptions();
    }
  };

  // Handlers for the TypeManager
  const handleAddType = async (typeName) => {
    const { error } = await supabase.from('option_types').insert({ name: typeName });
    if (error) alert('Error adding type: ' + error.message);
    else alert('Type added!');
  };

  const handleDeleteType = async (typeId, typeName) => {
    if (!globalThis.confirm(`Are you sure you want to delete the type "${typeName}"? This may affect existing options.`)) return;
    const { error } = await supabase.from('option_types').delete().eq('id', typeId);
    if (error) alert('Error deleting type: ' + error.message);
    else {
      alert('Type deleted!');
      fetchOptionTypes(); // Refresh the list of types
      fetchOptions(); // Refresh options as they may have changed
    }
  };


  if (loading) return <p className="text-gray-400">Loading options...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Column for adding and viewing options */}
      <div className="space-y-8">
        <form onSubmit={handleAddOption} className="space-y-4 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Add New Option</h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Option Name (e.g., Pink Panties)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field flex-grow"
            />
            {/* This is now a dropdown menu */}
             <select
              value={newTypeId}
              onChange={(e) => setNewTypeId(e.target.value)}
              className="input-field flex-grow" // <-- Make sure this class is here
              required
            >
              <option value="">Select a Type</option>
              {optionTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700">Add Option</button>
        </form>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Existing Options</h3>
          <div className="space-y-2">
            {options.map(opt => (
              <div key={opt.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
                <div>
                  <span className="font-bold">{opt.name}</span>
                  {/* Display the type name from the joined table */}
                  <span className="text-sm text-gray-400 ml-2">({opt.option_types?.name || 'No Type'})</span>
                </div>
                <button type="button" onClick={() => handleDeleteOption(opt.id, opt.name)} className="text-red-400 hover:underline text-sm">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column for managing option types */}
      <TypeManager 
        types={optionTypes}
        onAdd={handleAddType}
        onDelete={handleDeleteType}
        fetchTypes={fetchOptionTypes}
      />
    </div>
  );
}