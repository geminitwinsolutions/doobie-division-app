// supabase/functions/telegram-auth-callback/index.ts
import { serve } from 'std/http/server';
import { createClient, User, Session } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// A specific type for the `properties` object in the generateLink response
interface LinkProperties {
    access_token: string;
    refresh_token: string;
}

// A specific type for the overall `data` object from the generateLink response
interface GenerateLinkData {
    properties: LinkProperties;
    user: User | null;
    session: Session | null;
}

// Define a type for the data received from Telegram
interface TelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
  [key: string]: string | undefined;
}

// A function to validate the hash from Telegram
async function validateTelegramHash(authData: TelegramAuthData, botToken: string) {
  const dataCheckString = Object.keys(authData)
    .filter(key => key !== 'hash')
    .map(key => `${key}=${authData[key]}`)
    .sort()
    .join('\n');

  const secretKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(botToken));
  const hmacKey = await crypto.subtle.importKey('raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);
  const hmac = await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode(dataCheckString));
  const hex = Array.from(new Uint8Array(hmac)).map(b => b.toString(16).padStart(2, '0')).join('');

  return authData.hash === hex;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const adminRedirectUrl = Deno.env.get('ADMIN_REDIRECT_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!adminRedirectUrl || !supabaseUrl || !serviceRoleKey || !botToken) {
      throw new Error('Missing one or more required environment variables.');
    }
    
    const url = new URL(req.url);
    const authData = Object.fromEntries(url.searchParams.entries()) as TelegramAuthData;

    const isValid = await validateTelegramHash(authData, botToken);
    if (!isValid) {
      throw new Error("Invalid hash. Telegram data could not be verified.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('telegram_id')
      .eq('telegram_id', authData.id)
      .single();

    if (adminError || !adminData) {
      return new Response(JSON.stringify({ error: "Unauthorized: You are not a registered admin." }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: `${authData.id}@telegram.user`,
    });

    if (sessionError) throw sessionError;
    
    // ** THE FIX IS HERE **
    // Cast to 'unknown' first, then to our specific type to safely access properties.
    const linkData = data as unknown as GenerateLinkData;
    
    if (!linkData.properties?.access_token || !linkData.properties?.refresh_token) {
        throw new Error("Access token or refresh token not found in Supabase response.");
    }
    const { access_token, refresh_token } = linkData.properties;
    
    const redirectUrl = new URL(adminRedirectUrl);
    redirectUrl.hash = `access_token=${access_token}&refresh_token=${refresh_token}`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString()
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});