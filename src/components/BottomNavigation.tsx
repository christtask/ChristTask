import { Button } from "@/components/ui/button";
import { Home, MessageSquare, BookOpen } from "lucide-react";

interface BottomNavigationProps {
  activeTab: 'home' | 'chatbot' | 'bible' | 'forum';
  onTabChange: (tab: 'home' | 'chatbot' | 'bible' | 'forum') => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  console.log('BottomNavigation rendered with activeTab:', activeTab);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-[999] bg-[#1a1a1a] backdrop-blur-md border-t border-[#222] shadow-lg">
      <div className="flex justify-between items-center max-w-lg mx-auto px-2 sm:px-4" style={{ minHeight: 60 }}>
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 py-2 min-w-0 min-h-[44px] ${
            activeTab === 'home' ? 'text-[#8B5CF6]' : 'text-zinc-300'
          }`}
          style={{ background: activeTab === 'home' ? 'rgba(139,92,246,0.08)' : 'transparent', borderRadius: 12 }}
        >
          <Home className={`w-6 h-6 mb-0.5 ${activeTab === 'home' ? 'text-[#8B5CF6]' : 'text-zinc-400'}`} />
          <span className="text-xs font-medium">Home</span>
        </button>
        {/* Chatbot Tab */}
        <button
          onClick={() => onTabChange('chatbot')}
          className={`flex flex-col items-center justify-center flex-1 py-2 min-w-0 min-h-[44px] ${
            activeTab === 'chatbot' ? 'text-[#8B5CF6]' : 'text-zinc-300'
          }`}
          style={{ background: activeTab === 'chatbot' ? 'rgba(139,92,246,0.08)' : 'transparent', borderRadius: 12 }}
        >
          <MessageSquare className={`w-6 h-6 mb-0.5 ${activeTab === 'chatbot' ? 'text-[#8B5CF6]' : 'text-zinc-400'}`} />
          <span className="text-xs font-medium">Chatbot</span>
        </button>
        {/* Bible Tab */}
        <button
          onClick={() => onTabChange('bible')}
          className={`flex flex-col items-center justify-center flex-1 py-2 min-w-0 min-h-[44px] ${
            activeTab === 'bible' ? 'text-[#8B5CF6]' : 'text-zinc-300'
          }`}
          style={{ background: activeTab === 'bible' ? 'rgba(139,92,246,0.08)' : 'transparent', borderRadius: 12 }}
        >
          <BookOpen className={`w-6 h-6 mb-0.5 ${activeTab === 'bible' ? 'text-[#8B5CF6]' : 'text-zinc-400'}`} />
          <span className="text-xs font-medium">Bible</span>
        </button>
        {/* Forum Tab */}
        <button
          onClick={() => onTabChange('forum')}
          className={`flex flex-col items-center justify-center flex-1 py-2 min-w-0 min-h-[44px] ${
            activeTab === 'forum' ? 'text-[#8B5CF6]' : 'text-zinc-300'
          }`}
          style={{ background: activeTab === 'forum' ? 'rgba(139,92,246,0.08)' : 'transparent', borderRadius: 12 }}
        >
          <MessageSquare className={`w-6 h-6 mb-0.5 ${activeTab === 'forum' ? 'text-[#8B5CF6]' : 'text-zinc-400'}`} />
          <span className="text-xs font-medium">Forum</span>
        </button>
      </div>
    </nav>
  );
};
