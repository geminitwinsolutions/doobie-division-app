import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function OptionManager() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('options').select('*').order('type').order('name');
    if (error) {
      console.error("Error fetching options:", error);
    } else {
      setOptions(data || []);
    }
    setLoading(false);
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newName || !newType) {
      alert('Please provide both a name and a type.');
      return;
    }
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addOption', payload: { name: newName, type: newType } },
    });
    if (error) {
      alert('Error adding option: ' + error.message);
    } else {
      alert(`Option "${newName}" added successfully!`);
      setNewName('');
      setNewType('');
      fetchOptions();
    }
  };

  const handleDeleteOption = async (optionId, optionName) => {
    if (!window.confirm(`Are you sure you want to delete "${optionName}"?`)) return;
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'deleteOption', payload: { id: optionId } },
    });
    if (error) {
      alert('Error deleting option: ' + error.message);
    } else {
      alert('Option deleted successfully!');
      fetchOptions();
    }
  };

  if (loading) return <p className="text-gray-400">Loading options...</p>;

  return (
    <div>
      <form onSubmit={handleAddOption} className="space-y-4 bg-gray-900 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-white">Add New Option</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Option Name (e.g., Pink Panties)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-field flex-grow"
          />
          <input
            type="text"
            placeholder="Option Type (e.g., Strain, Flavor)"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="input-field flex-grow"
          />
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
                <span className="text-sm text-gray-400 ml-2">({opt.type})</span>
              </div>
              <button onClick={() => handleDeleteOption(opt.id, opt.name)} className="text-red-400 hover:underline text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}