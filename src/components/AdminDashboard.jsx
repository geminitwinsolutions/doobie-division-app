// src/components/AdminDashboard.jsx
import { useState } from 'react';
import ProductManager from './admin/ProductManager.jsx';
import OptionManager from './admin/OptionManager.jsx';
import MenuManager from './admin/MenuManager.jsx';
import AdminManager from './admin/AdminManager.jsx';
import DeliveriesManager from './admin/DeliveriesManager.jsx'; // 1. Import the new component

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('deliveries'); // 2. Default to deliveries

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'deliveries':
        return <DeliveriesManager />; // 3. Add the new case
      case 'products':
        return <ProductManager />;
      case 'options':
        return <OptionManager />;
      case 'menuStructure':
        return <MenuManager />;
      case 'manageAdmins':
        return <AdminManager />;
      default:
        return <DeliveriesManager />;
    }
  };

  return (
    <div className="container mx-auto p-4 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-300">Welcome, {user.user_metadata?.first_name || 'Admin'}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-600 mb-6">
        {/* 4. Add the new tab button */}
        <TabButton name="deliveries" activeTab={activeTab} onClick={setActiveTab}>Deliveries</TabButton>
        <TabButton name="products" activeTab={activeTab} onClick={setActiveTab}>Products</TabButton>
        <TabButton name="options" activeTab={activeTab} onClick={setActiveTab}>Options</TabButton>
        <TabButton name="menuStructure" activeTab={activeTab} onClick={setActiveTab}>Menu Structure</TabButton>
        <TabButton name="manageAdmins" activeTab={activeTab} onClick={setActiveTab}>Manage Admins</TabButton>
      </div>

      {/* Active Tab Content */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        {renderActiveTab()}
      </div>
    </div>
  );
}

// A helper component for the tabs
function TabButton({ name, activeTab, onClick, children }) {
  const isActive = name === activeTab;
  return (
    <button
      type="button"
      onClick={() => onClick(name)}
      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
        isActive
          ? 'border-emerald-400 text-emerald-400'
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}