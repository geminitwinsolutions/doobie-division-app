// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [deal, setDeal] = useState(null); // Start with null

  useEffect(() => {
    const fetchDeal = async () => {
      // Fetch the first deal marked as featured
      const { data, error } = await supabase
        .from('deals')
        .select('title, description')
        .eq('is_featured', true)
        .limit(1)
        .single(); // .single() gets one record instead of an array

      if (data) setDeal(data);
    };
    fetchDeal();
  }, []);

  return (
    <div className="text-center">
      <div className="bg-black bg-opacity-70 p-8 rounded-xl">
        <h1 className="text-4xl font-bold text-white">Welcome to Doobie Division</h1>
        {/* ... other welcome content ... */}
      </div>

      {/* Conditionally render the deal card only when deal data exists */}
      {deal && (
        <div className="mt-8 bg-yellow-400 text-black p-6 rounded-lg">
          <h3 className="text-2xl font-bold">{deal.title}</h3>
          <p>{deal.description}</p>
          <p className="font-bold">Today's Featured Offer!</p>
        </div>
      )}
    </div>
  );
}