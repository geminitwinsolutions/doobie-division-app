// src/components/admin/AdminManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminManager() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admins').select('*');
    if (error) {
      console.error("Error fetching admins:", error);
      alert('Could not fetch admins.');
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!telegramId || !telegramUsername) {
      alert('Please provide both a Telegram ID and a username.');
      return;
    }

    // Note: The 'admin-actions' function checks if the current user is a super_admin
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'addAdmin',
        payload: { telegram_id: parseInt(telegramId, 10), telegram_username: telegramUsername },
      },
    });

    if (error) {
      alert('Error adding admin: ' + error.message);
    } else {
      alert(`Admin "${telegramUsername}" added successfully!`);
      setTelegramId('');
      setTelegramUsername('');
      fetchAdmins();
    }
  };

  // You would also create a handleDeleteAdmin function here if needed

  if (loading) return <p className="text-gray-400">Loading admins...</p>;

  return (
    <div>
      <form onSubmit={handleAddAdmin} className="space-y-4 bg-gray-900 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-white">Add New Admin</h3>
        <p className="text-sm text-gray-400">
            Only Super Admins can add new administrators. You can find a user's Telegram ID by using a bot like @userinfobot.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            placeholder="Telegram User ID"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            className="input-field flex-grow"
          />
          <input
            type="text"
            placeholder="Telegram Username (e.g., @username)"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            className="input-field flex-grow"
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700">Add Admin</button>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Existing Admins</h3>
        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
              <div>
                <span className="font-bold">{admin.telegram_username}</span>
                <span className="text-sm text-gray-400 ml-2">(ID: {admin.telegram_id})</span>
              </div>
               <span className={`text-xs font-bold px-2 py-1 rounded-full ${admin.is_super_admin ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}>
                {admin.is_super_admin ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}