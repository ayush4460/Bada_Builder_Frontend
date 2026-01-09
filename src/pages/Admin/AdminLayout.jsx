import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
