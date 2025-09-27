// supabase/functions/admin-actions/index.ts
import { serve } from 'std/http/server';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header is missing' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500, headers: corsHeaders }
      );
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid user session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    if (!userData.user.user_metadata?.telegram_id) {
        return new Response(JSON.stringify({ error: 'User metadata is missing Telegram ID' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('role')
      .eq('telegram_id', userData.user.user_metadata.telegram_id)
      .single();

    if (adminError || !adminData) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Not an admin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let result;
    switch (action) {
      case 'assignOrder':
        result = await supabase.from('orders').update({ assigned_driver_id: payload.driverId, status: 'assigned' }).eq('id', payload.orderId);
        break;
      case 'addCategory':
        result = await supabase.from('categories').insert([payload]);
        break;
      case 'addSubcategory':
        result = await supabase.from('subcategories').insert([payload]);
        break;
      case 'addProduct':
        result = await supabase.from('products').insert([payload]);
        break;
      
      // ** THE FIX IS HERE **
      // The payload contains `type_id`, so we insert it into the `type_id` column.
      case 'addOption':
        result = await supabase.from('options').insert([{ name: payload.name, type_id: payload.type_id }]);
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
      case 'addAdmin': {
        if (adminData.role !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'Unauthorized: Super admin access required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const newAdminPayload = {
          telegram_id: payload.telegram_id,
          telegram_username: payload.telegram_username,
          role: 'admin',
        };
        result = await supabase.from('admins').insert([newAdminPayload]);
        break;
      }
      default: {
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    if (result && result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});