
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="flex-shrink-0">
          <Navbar />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
