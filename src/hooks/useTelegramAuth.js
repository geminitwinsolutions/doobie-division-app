import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTelegramAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      // The Telegram Web App script provides this global object
      const tg = window.Telegram.WebApp;

      if (tg.initData) {
        // This is the secure data string from Telegram that proves the user's identity
        const initData = tg.initData;

        // We send this data to our Supabase function to verify it and get a session
        const { data, error } = await supabase.functions.invoke('telegram-verify-auth', {
          body: { initData },
        });

        if (error) {
          console.error("Authentication error:", error);
          setLoading(false);
          return;
        }

        // The function returns a valid Supabase session, which we then set in the client
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (sessionError) {
          console.error("Error setting session:", sessionError);
        } else {
          setUser(sessionData.user);
        }
      } else {
        // This will be logged if you open the app in a regular browser
        console.log("Not running inside a Telegram Mini App.");
      }
      setLoading(false);
    };

    // Check if the Telegram script has loaded and initData is available
    if (window.Telegram?.WebApp?.initData) {
      authenticate();
    } else {
      setLoading(false); // Not in Telegram, stop loading
    }
  }, []);

  return { user, loading };
}