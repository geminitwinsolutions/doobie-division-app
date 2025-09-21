// supabase/functions/admin-actions/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  if (!authHeader || authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const { action, payload } = await req.json();
    
    if (action === 'addAdmin') {
      const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

      if (userError || !userData?.user) {
          return new Response(JSON.stringify({ error: 'Failed to authenticate user.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('is_super_admin')
        .eq('telegram_id', userData.user.user_metadata.telegram_id)
        .single();
    
      if (!adminData || !adminData.is_super_admin) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Super admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      const newAdminPayload = {
        telegram_id: payload.telegram_id,
        telegram_username: payload.telegram_username, // Add this line
        is_super_admin: false,
      };
      const { error } = await supabase.from('admins').insert([newAdminPayload]);
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, message: 'Admin added successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Existing switch statement for other actions
    let result;
    switch (action) {
      case 'addCategory':
        result = await supabase.from('categories').insert([payload]);
        break;
      case 'addSubcategory':
        result = await supabase.from('subcategories').insert([payload]);
        break;
      case 'addProduct':
        result = await supabase.from('products').insert([payload]);
        break;
      case 'addOption':
        result = await supabase.from('options').insert([payload]);
        break;
      case 'deleteOption':
        result = await supabase.from('options').delete().eq('id', payload.id);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});