// src/components/admin/DeliveriesManager.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

const DELIVERY_AREAS = ["North Zone", "South Zone", "East Side", "West Side", "Other"];

function OrderCard({ order, drivers, onAssign }) {
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const handleAssignClick = () => {
    if (!selectedDriverId) {
      alert('Please select a driver to assign.');
      return;
    }
    onAssign(order.id, selectedDriverId);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        {/* Order Details */}
        <div>
          <p className="font-bold text-emerald-400">Order #{order.id}</p>
          <p className="text-gray-300"><strong>Customer:</strong> {order.customer_name}</p>
          <p className="text-gray-300"><strong>Address:</strong> {order.customer_address}</p>
        </div>
        {/* Order Items */}
        <div>
          <p className="font-semibold text-gray-300">Items:</p>
          <ul className="list-disc list-inside text-gray-400">
            {order.order_items.map((item, index) => (
              <li key={`${item.product_id}-${index}`}>
                {item.quantity} x {item.products.name}
              </li>
            ))}
          </ul>
        </div>
        {/* Area and Total */}
        <div>
          <p className="font-bold text-gray-300">Area</p>
          <p className="text-white font-semibold">{order.delivery_area}</p>
          <p className="font-bold text-lg text-white mt-2">Total: ${order.total_price}</p>
        </div>
        {/* Status and Assignment */}
        <div className="flex flex-col justify-between items-end">
          <span className={`text-xs font-bold px-2 py-1 inline-block rounded-full ${
            order.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
          }`}>
            {order.status}
          </span>
          {order.status === 'pending' && (
            <div className="flex gap-2 mt-4 w-full">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="input-field w-full text-sm"
              >
                <option value="">Assign Driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.full_name || driver.telegram_username}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeliveriesManager() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const initialFetch = async () => {
        setLoading(true);
        await Promise.all([fetchOrders(), fetchDrivers()]);
        setLoading(false);
    };
    initialFetch();
  }, []);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredOrders(allOrders);
    } else {
      setFilteredOrders(allOrders.filter(order => order.delivery_area === activeFilter));
    }
  }, [activeFilter, allOrders]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items (*, products ( name ) )`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setAllOrders(data || []);
      setFilteredOrders(data || []);
    }
  };
  
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('id, full_name, telegram_username')
      .eq('role', 'driver');

    if (error) {
      console.error("Error fetching drivers:", error);
    } else {
      setDrivers(data || []);
    }
  };

  // --- THIS IS THE FINAL UPDATE ---
  const handleAssignOrder = async (orderId, driverId) => {
    const { error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'assignOrder',
        payload: { orderId, driverId },
      },
    });

    if (error) {
      alert(`Error assigning order: ${error.message}`);
    } else {
      alert(`Order #${orderId} has been assigned!`);
      // Refresh the orders list to show the status change
      fetchOrders();
    }
  };
  // --- END UPDATE ---

  if (loading) return <p className="text-gray-400">Loading orders...</p>;

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4">Pending Deliveries</h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveFilter('All')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
            activeFilter === 'All' ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {DELIVERY_AREAS.map(area => (
          <button
            key={area}
            type="button"
            onClick={() => setActiveFilter(area)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeFilter === area ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} drivers={drivers} onAssign={handleAssignOrder} />
          ))
        ) : (
          <p className="text-gray-400">No orders found for this filter.</p>
        )}
      </div>
    </div>
  );
}