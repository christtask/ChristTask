import React, { useState, useEffect } from 'react';
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
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Add theme state

  // Sync theme with document body
  useEffect(() => {
    const checkTheme = () => {
      const bodyBg = document.body.style.backgroundColor;
      const isDark = bodyBg === 'rgb(0, 0, 0)' || bodyBg === '#000000';
      setIsDarkTheme(isDark);
    };
    
    checkTheme();
    
    // Check theme periodically
    const interval = setInterval(checkTheme, 100);
    
    return () => clearInterval(interval);
  }, []);

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
        className={`fixed top-0 left-0 h-full border-r z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out hidden md:flex ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isDarkTheme ? 'bg-black border-gray-700' : 'bg-white border-gray-300'}`}
      >
        {/* Header with toggle button */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isCollapsed ? 'justify-center' : ''
        } ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
          {!isCollapsed && (
            <div className="flex items-center">
              <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>ChristTask</h2>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              isCollapsed ? 'w-full' : ''
            } ${isDarkTheme ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-black'}`}
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
                      : isDarkTheme ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-black'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-white' : isDarkTheme ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'
                  }`} />
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-100' : isDarkTheme ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'
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
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-left ${
              isDarkTheme ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-black'
            }`}
            title="Logout"
          >
            <X className={`w-5 h-5 flex-shrink-0 ${
              isDarkTheme ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'
            }`} />
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
          className={`fixed inset-0 z-40 hidden md:block ${
            isDarkTheme ? 'bg-black bg-opacity-50' : 'bg-gray-900 bg-opacity-30'
          }`}
          onClick={() => setIsCollapsed(true)}
        />
      )}


    </>
  );
}; 