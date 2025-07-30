import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  User, 
  Brain,
  Shield,
  Heart,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarNavigationProps {
  activeTab: 'home' | 'chatbot' | 'bible' | 'forum';
  onTabChange: (tab: 'home' | 'chatbot' | 'bible' | 'forum') => void;
}

export const SidebarNavigation = ({ activeTab, onTabChange }: SidebarNavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await signOut();
      console.log('Logout successful');
      // The user will be redirected automatically by the auth state change in App.tsx
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      description: 'Main dashboard'
    },
    {
      id: 'chatbot' as const,
      label: 'AI Chat',
      icon: MessageSquare,
      description: 'Christian apologetics assistant'
    },
    {
      id: 'bible' as const,
      label: 'Bible',
      icon: BookOpen,
      description: 'Bible study and reading'
    },
    {
      id: 'forum' as const,
      label: 'Forum',
      icon: MessageSquare,
      description: 'Community discussions'
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-black border-r border-gray-700 z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out hidden md:flex ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header with toggle button */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-700 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          {!isCollapsed && (
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-white">ChristTask</h2>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
              isCollapsed ? 'w-full' : ''
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-left group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-300'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto px-2 py-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
            title="Logout"
          >
            <X className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
            {!isCollapsed && (
              <div className="ml-3">
                <div className="font-medium">Logout</div>
              </div>
            )}
          </button>
        </div>

      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:block"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Main content margin */}
      <div className={`transition-all duration-300 hidden md:block ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* This div ensures the main content is pushed to the right */}
      </div>
    </>
  );
}; 