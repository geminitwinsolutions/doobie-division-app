// src/components/TelegramLoginButton.jsx

export default function TelegramLoginButton() {
  const handleLogin = () => {
    // Dynamically get the Supabase URL from your .env file
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // This will redirect the user to a Supabase function that handles the Telegram auth
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