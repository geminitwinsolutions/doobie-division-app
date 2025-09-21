// supabase/functions/admin-actions/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { action, payload } = await req.json();
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  // Validate the user's session token for all actions
  if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header is missing' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid user session' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
  }

  // Get the user's admin status
  const { data: adminData } = await supabase
      .from('admins')
      .select('is_super_admin')
      .eq('telegram_id', userData.user.user_metadata.telegram_id)
      .single();

  if (!adminData) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Not an admin' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
  }

  try {
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
      case 'updateCategory':
        result = await supabase.from('categories').update({ name: payload.name }).eq('id', payload.id);
        break;
      case 'deleteCategory':
        result = await supabase.from('categories').delete().eq('id', payload.id);
        break;
      case 'updateSubcategory':
        result = await supabase.from('subcategories').update({ name: payload.name }).eq('id', payload.id);
        break;
      case 'deleteSubcategory':
        result = await supabase.from('subcategories').delete().eq('id', payload.id);
        break;
      case 'addAdmin':
        // This action requires super admin privileges
        if (!adminData.is_super_admin) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Super admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }
        const newAdminPayload = {
            telegram_id: payload.telegram_id,
            telegram_username: payload.telegram_username,
            is_super_admin: false,
        };
        result = await supabase.from('admins').insert([newAdminPayload]);
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