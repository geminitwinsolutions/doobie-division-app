// src/components/TelegramLoginButton.jsx
import React from 'react';

export default function TelegramLoginButton() {
  const handleLogin = () => {
    // This will redirect the user to a Supabase function that handles the Telegram auth
    window.location.href = `https://irissqrnhbgkibxciezw.supabase.co/functions/v1/telegram-auth-start`;
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        <button onClick={handleLogin} className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
            Login with Telegram
        </button>
    </div>
  );
}