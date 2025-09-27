// supabase/functions/submit-order/index.ts
import { serve } from 'std/http/server';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

interface OrderItem {
  id: string; // This should be the product_id (UUID)
  name: string;
  quantity: number;
  displayPrice: number;
  selectedOptions: Record<string, string>;
  product: { id: string }; // Make sure product object with id is passed
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { payload } = await req.json();
    const { name: customer_name, address: customer_address, items } = payload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Calculate the total price from the items array
    const totalPrice = items.reduce((sum: number, item: OrderItem) => {
      return sum + (item.displayPrice * item.quantity);
    }, 0);

    // 2. Insert the main order into the 'orders' table
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_address,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Prepare the line items for the 'order_items' table
    const orderItemsToInsert = items.map((item: OrderItem) => ({
      order_id: orderData.id,
      product_id: item.product.id, // Ensure your frontend sends product.id
      quantity: item.quantity,
      price_at_purchase: item.displayPrice,
      selected_options: item.selectedOptions,
    }));

    // 4. Insert all line items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    return new Response(JSON.stringify({ success: true, orderId: orderData.id }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});