// src/components/admin/AdminManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminManager() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdminId, setNewAdminId] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    // Fetch the new telegram_username column
    const { data, error } = await supabase.from('admins').select('telegram_id, is_super_admin, telegram_username').order('is_super_admin', { ascending: false });
    if (error) {
      console.error("Error fetching admins:", error);
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminId || !newAdminUsername) {
        alert("Please provide both a Telegram ID and a username.");
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert("You must be logged in to add a new admin.");
      return;
    }

    const { error } = await supabase.functions.invoke('admin-actions', {
      body: { action: 'addAdmin', payload: { telegram_id: newAdminId, telegram_username: newAdminUsername } },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
      alert('Error adding admin: ' + error.message);
    } else {
      alert('Admin added successfully!');
      setNewAdminId('');
      setNewAdminUsername('');
      fetchAdmins(); // Refresh list
    }
  };

  if (loading) return <p className="text-gray-400">Loading admins...</p>;

  return (
    <div>
      <form onSubmit={handleAddAdmin} className="space-y-4 bg-gray-900 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-white">Add New Admin</h3>
        <input
          type="number"
          placeholder="Telegram User ID"
          value={newAdminId}
          onChange={(e) => setNewAdminId(e.target.value)}
          className="input-field w-full"
          required
        />
        <input
          type="text"
          placeholder="Telegram Username"
          value={newAdminUsername}
          onChange={(e) => setNewAdminUsername(e.target.value)}
          className="input-field w-full"
          required
        />
        <button type="submit" className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700">Add Admin</button>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Existing Admins</h3>
        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.telegram_id} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
              <span>{admin.telegram_username} ({admin.telegram_id}) {admin.is_super_admin && '(Super Admin)'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}