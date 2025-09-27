// supabase/functions/telegram-auth-start/index.ts
import { serve } from 'std/http/server';

serve((_req: Request) => {
  try {
    const botName = Deno.env.get('TELEGRAM_BOT_NAME');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!botName || !supabaseUrl) {
      throw new Error('Missing TELEGRAM_BOT_NAME or SUPABASE_URL environment variables.');
    }

    const redirectUrl = `${supabaseUrl}/functions/v1/telegram-auth-callback`;

    // Construct the Telegram login URL
    const telegramLoginUrl = new URL('https://oauth.telegram.org/auth');
    telegramLoginUrl.searchParams.set('bot_id', botName);
    telegramLoginUrl.searchParams.set('origin', redirectUrl);
    telegramLoginUrl.searchParams.set('return_to', redirectUrl);

    // Redirect the user
    return new Response(null, {
      status: 302, // Found (Redirect)
      headers: {
        'Location': telegramLoginUrl.toString(),
      },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});