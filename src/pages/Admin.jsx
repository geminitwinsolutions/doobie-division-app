// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import AdminDashboard from '../components/AdminDashboard.jsx';

function TelegramLogin() {
  const handleLogin = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    globalThis.location.href = `${supabaseUrl}/functions/v1/telegram-auth-start`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center text-white">
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
            <button 
              type="button"
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
    const setSessionFromUrl = async (accessToken, refreshToken) => {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Error setting session from URL:", error);
        // Clear the hash from the URL to prevent loops
        globalThis.location.hash = '';
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    // This function will run once when the component loads
    const fetchInitialSession = async () => {
      // Check for tokens in the URL hash
      const hash = globalThis.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await setSessionFromUrl(accessToken, refreshToken);
          // Clean the URL
          globalThis.history.replaceState(null, '', globalThis.location.pathname);
          return;
        }
      }

      // If no tokens in URL, check for an existing session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchInitialSession();

    // Listen for future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-white text-center p-12">Loading...</div>;
  }

  // If there's no session, show the login button. Otherwise, show the dashboard.
  return (
    <div>
      {!session ? <TelegramLogin /> : <AdminDashboard user={session.user} />}
    </div>
  );
}