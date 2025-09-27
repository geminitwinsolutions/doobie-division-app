// src/components/admin/DeliveriesManager.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export default function DeliveriesManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    // Fetch orders and their line items in one go
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          quantity,
          price_at_purchase,
          selected_options,
          products ( name ) 
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      alert('Could not fetch orders.');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  if (loading) return <p className="text-gray-400">Loading orders...</p>;

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Pending Deliveries</h3>
      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-gray-900 p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-bold text-emerald-400">Order #{order.id}</p>
                  <p className="text-gray-300"><strong>Customer:</strong> {order.customer_name}</p>
                  <p className="text-gray-300"><strong>Address:</strong> {order.customer_address}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Items:</p>
                  <ul className="list-disc list-inside text-gray-400">
                    {order.order_items.map(item => (
                      <li key={item.product_id}>
                        {item.quantity} x {item.products.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-lg text-white">Total: ${order.total_price}</p>
                  <span className={`text-xs font-bold px-2 py-1 mt-2 inline-block rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              {/* We will add the driver assignment dropdown here in Phase 3 */}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No pending orders found.</p>
        )}
      </div>
    </div>
  );
}