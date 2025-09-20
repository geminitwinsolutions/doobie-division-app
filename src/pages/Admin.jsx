import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AdminDashboard from '../components/AdminDashboard';

// This is the new, simpler Login component
function TelegramLogin() {
  const handleLogin = () => {
    // This URL points to a function that starts the Telegram OAuth flow.
    // We will create this function next.
    window.location.href = `https://irissqrnhbgkibxciezw.supabase.co/functions/v1/telegram-auth-start`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center text-white">
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
            <button 
              onClick={handleLogin} 
              className="px-6 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
                Login with Telegram
            </button>
        </div>
    </div>
  );
}


export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the page loads
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Listen for changes in authentication state (e.g., after login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-white text-center p-12">Loading...</div>;
  }

  // If there is no session, show the login button.
  // Otherwise, show the full admin dashboard.
  return (
    <div>
      {!session ? <TelegramLogin /> : <AdminDashboard user={session.user} />}
    </div>
  );
}