import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Assuming your Header is in the same folder

// A simple Footer component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; 2025 Doobie Division. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Outlet is a placeholder where your page components will be rendered */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}