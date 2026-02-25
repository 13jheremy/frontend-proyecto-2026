// src/components/layout/MainLayout.jsx
import React, { createContext, useContext, useState } from 'react';
import Sidebar from './Sidebar';

// Context para manejar el estado del sidebar
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className={`flex-1 transition-all duration-200 overflow-y-auto h-screen ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="p-4 lg:p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default MainLayout;
