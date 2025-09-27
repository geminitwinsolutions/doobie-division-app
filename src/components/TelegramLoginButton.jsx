// src/components/TelegramLoginButton.jsx

export default function TelegramLoginButton() {
    // From src/pages/Admin.jsx (TelegramLogin function):
    const handleLogin = () => {
       const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        globalThis.location.href = `${supabaseUrl}/functions/v1/telegram-auth-start`;
    };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        {/* Added type="button" to the button element */}
        <button 
          type="button" 
          onClick={handleLogin} 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
        >
            Login with Telegram
        </button>
    </div>
  );
}