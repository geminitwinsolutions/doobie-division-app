// supabase/functions/telegram-auth-callback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const ADMIN_REDIRECT_URL = Deno.env.get('ADMIN_REDIRECT_URL'); // e.g., http://localhost:5173/admin

// A simple function to validate the hash from Telegram
async function validateTelegramHash(authData) {
  const dataCheckString = Object.keys(authData)
    .filter(key => key !== 'hash')
    .map(key => `${key}=${authData[key]}`)
    .sort()
    .join('\n');

  const secretKey = new TextEncoder().encode('WebAppData');
  const secretKeyHash = await crypto.subtle.digest('SHA-256', secretKey);
  
  const hmacKey = await crypto.subtle.importKey('raw', secretKeyHash, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);
  const hmac = await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode(dataCheckString));
  
  const hex = Array.from(new Uint8Array(hmac)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return authData.hash === hex;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const authData = Object.fromEntries(url.searchParams.entries());

    // 1. Validate the hash
    // NOTE: For production, hash validation is critical for security.
    // The simple validation below might need adjustment based on official examples.
    
    const isValid = await validateTelegramHash(authData);
    if (!isValid) {
      throw new Error("Invalid hash. Telegram data could not be verified.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Check if the user is a registered admin in your `admins` table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('telegram_id')
      .eq('telegram_id', authData.id)
      .single();

    if (adminError || !adminData) {
      console.error("Admin check error:", adminError);
      return new Response(JSON.stringify({ error: "Unauthorized: You are not a registered admin." }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 3. The user is a valid admin, so create a session for them
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: `${authData.id}@telegram.user`, // Create a dummy email
    });

    if (sessionError) throw sessionError;

    const { access_token, refresh_token } = sessionData.properties;
    
    // 4. Redirect the user back to the admin page with the tokens in the URL hash
    const redirectUrl = new URL(ADMIN_REDIRECT_URL);
    redirectUrl.hash = `access_token=${access_token}&refresh_token=${refresh_token}`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString()
      }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});