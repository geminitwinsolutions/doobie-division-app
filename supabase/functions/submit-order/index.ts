// supabase/functions/submit-order/index.ts
import { serve } from 'std/http/server';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

interface OrderItem {
  id: string; 
  name: string;
  quantity: number;
  displayPrice: number;
  selectedOptions: Record<string, string>;
  product: { id: string };
}

// --- NEW ---
// Define your delivery areas and the keywords to look for in an address.
// You can customize this list to match your business's delivery zones.
const DELIVERY_AREAS: Record<string, string[]> = {
  "North Zone": ["north", "n.", "uptown"],
  "South Zone": ["south", "s.", "downtown"],
  "East Side": ["east", "e."],
  "West Side": ["west", "w."],
};

function determineDeliveryArea(address: string): string {
  const lowerCaseAddress = address.toLowerCase();
  for (const area in DELIVERY_AREAS) {
    for (const keyword of DELIVERY_AREAS[area]) {
      if (lowerCaseAddress.includes(keyword)) {
        return area;
      }
    }
  }
  return "Other"; // Default area if no keywords match
}
// --- END NEW ---


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { payload } = await req.json();
    const { name: customer_name, address: customer_address, items } = payload;

    // --- NEW ---
    // Determine the delivery area from the address
    const deliveryArea = determineDeliveryArea(customer_address);
    // --- END NEW ---

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const totalPrice = items.reduce((sum: number, item: OrderItem) => {
      return sum + (item.displayPrice * item.quantity);
    }, 0);

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_address,
        total_price: totalPrice,
        status: 'pending',
        delivery_area: deliveryArea, // <-- Save the determined area
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItemsToInsert = items.map((item: OrderItem) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_purchase: item.displayPrice,
      selected_options: item.selectedOptions,
    }));

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