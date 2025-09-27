// supabase/functions/telegram-webhook/index.ts
import { serve } from 'std/http/server';
import { corsHeaders } from '../_shared/cors.ts';

// Define a type for the items in the cart
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedOptions: string[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { payload } = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables.');
    }

    const orderItems = payload.items.map((item: OrderItem) => {
      const options = item.selectedOptions && item.selectedOptions.length > 0
        ? `\n**Options:**\n${item.selectedOptions.map((opt: string) => `  - ${opt}`).join('\n')}`
        : '';
      return `
**${item.quantity} x ${item.name}**
**Price:** $${item.price}
${options}
      `;
    }).join('\n\n');

    const orderMessage = `
**New Order Received!**
---
**Customer Name:** ${payload.name}
**Address:** ${payload.address}
---
**Order Details:**
${orderItems}
    `;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: orderMessage,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Telegram API error:', data);
      throw new Error('Telegram API failed to send message');
    }

    return new Response(JSON.stringify({ message: 'Order submitted to Telegram.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});