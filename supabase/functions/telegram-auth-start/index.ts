// supabase/functions/telegram-auth-start/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TELEGRAM_BOT_NAME = Deno.env.get('TELEGRAM_BOT_NAME')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

serve(async (_req) => {
  // The URL for your callback function
  const redirectUrl = `${SUPABASE_URL}/functions/v1/telegram-auth-callback`;

  // Construct the Telegram login URL
  const telegramLoginUrl = `https://oauth.telegram.org/auth?bot_id=${TELEGRAM_BOT_NAME}&origin=${encodeURIComponent(redirectUrl)}&return_to=${encodeURIComponent(redirectUrl)}`;

  // Redirect the user to the Telegram authentication page
  return new Response(null, {
    status: 302,
    headers: {
      'Location': telegramLoginUrl,
    },
  });
})