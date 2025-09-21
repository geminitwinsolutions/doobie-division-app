import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getAuth } from '@supabase/supabase-js';

serve(async (req) => {
  const supabase = getAuth(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'telegram',
    options: {
      redirectTo: `${req.headers.get('referer')}admin`,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});