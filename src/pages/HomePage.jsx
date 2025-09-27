import { useState, useEffect } from 'react'; // <--- ADDED
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function HomePage() {
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    const fetchDeal = async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('title, description')
        .eq('is_featured', true)
        .limit(1);

      if (error) {
        console.error("Error fetching deal:", error);
      } else if (data && data.length > 0) {
        setDeal(data[0]);
      }
    };
    fetchDeal();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center text-white px-4">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 md:p-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 font-display">
          Welcome to Doobie Division
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
          Your premier source for high-quality products. Browse our menu or check out our ordering info.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/category/all"
            // Add a hover scale effect for a dynamic button
            className="inline-block bg-emerald-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105"
          >
            View Menu
          </Link>
          <Link
            to="/info"
            className="inline-block bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-300 transition-transform hover:scale-105"
          >
            Ordering Info
          </Link>
        </div>
      </div>

      {/* Featured Deal Card */}
      {deal && (
        <div className="mt-12 w-full max-w-3xl">
          <div className="bg-gradient-to-r from-emerald-500 to-yellow-500 p-8 rounded-xl text-white text-center shadow-lg">
            <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">{deal.title}</h3>
            <p className="text-5xl font-bold font-display mb-2">{deal.description}</p>
            <p className="opacity-80">Today's Featured Offer!</p>
          </div>
        </div>
      )}
    </div>
  );
}