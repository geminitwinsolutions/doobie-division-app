import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { payload } = await req.json();
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  const orderItems = payload.items.map(item => {
    const options = item.selectedOptions.length > 0
      ? `\n**Options:**\n${item.selectedOptions.map(opt => `  - ${opt}`).join('\n')}`
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
  
  try {
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: orderMessage,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Telegram API error:', data);
      throw new Error('Telegram API failed to send message');
    }

    return new Response(JSON.stringify({ message: 'Order submitted to Telegram.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error in Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});