// TEST: If you see this, deployment works!
import { LandingPage } from "@/components/LandingPage";
import PaymentPageWrapper from "./PaymentPageWrapper";
import { AuthPage } from "@/components/AuthPage";
import { ChatInterface } from "@/components/ChatInterface";
import { ChatbotSuite } from "@/components/ChatbotSuite";
import { TopicCategories } from "@/components/TopicCategories";
import { GuestAccountPrompt } from "@/components/GuestAccountPrompt";
import { WelcomeToChatbot } from "@/components/WelcomeToChatbot";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('landing' as 'landing' | 'payment' | 'auth' | 'app');
  const [authMode, setAuthMode] = useState('signin' as 'signin' | 'signup');
  const [selectedTopic, setSelectedTopic] = useState(null as string | null);
  const [showTopics, setShowTopics] = useState(true);
  const [forceShowLanding, setForceShowLanding] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paidUser, setPaidUser] = useState(false); // Track if user just paid
  const [showChatbot, setShowChatbot] = useState(false);
  const [activeTab, setActiveTab] = useState('home' as 'home' | 'chatbot' | 'profile');
  const { user, loading, signOut } = useAuth();
  const { isGuest, guestUser, handleGuestSuccess, showAccountPrompt } = useGuestAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle payment success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const isGuestCheckout = urlParams.get('guest') === 'true';
    const sessionId = urlParams.get('session_id');

    if (success === 'true') {
      setIsProcessingPayment(true);
      setPaidUser(true); // Mark user as having just paid
      
      if (isGuestCheckout && sessionId) {
        // Handle guest checkout success - go directly to chatbot
        handleGuestSuccess(sessionId).then(() => {
          setIsProcessingPayment(false);
          setCurrentPage('app');
          setShowTopics(false); // Skip topics, go directly to chat
          toast({
            title: "Payment successful!",
            description: "Welcome to ChristTask! You now have full access to the chatbot.",
          });
        }).catch((error) => {
          setIsProcessingPayment(false);
          console.error('Guest success handling failed:', error);
          toast({
            title: "Payment processed, but access failed",
            description: "Your payment was successful, but we couldn't set up your account. Please contact support.",
            variant: "destructive"
          });
        });
      } else if (user) {
        // Handle authenticated user payment success - go directly to chatbot
        setIsProcessingPayment(false);
        setCurrentPage('app');
        setShowTopics(false); // Skip topics, go directly to chat
        toast({
          title: "Payment successful!",
          description: "Welcome to ChristTask! You now have full access to the chatbot.",
        });
      } else {
        // Payment success but no user - this shouldn't happen but handle gracefully
        setIsProcessingPayment(false);
        toast({
          title: "Payment successful",
          description: "Please sign in to access your subscription.",
        });
        setCurrentPage('auth');
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleGuestSuccess, user, toast]);

  // Redirect authenticated users to app
  useEffect(() => {
    if ((user || (isGuest && guestUser)) && currentPage === 'auth' && !isProcessingPayment) {
      setCurrentPage('app');
      // If user just paid, skip topics and go to chat
      if (paidUser) {
        setShowTopics(false);
      }
    } else if ((user || (isGuest && guestUser)) && currentPage === 'landing' && !forceShowLanding && !isProcessingPayment) {
      setCurrentPage('app');
      // If user just paid, skip topics and go to chat
      if (paidUser) {
        setShowTopics(false);
      }
    }
  }, [user, guestUser, isGuest, currentPage, forceShowLanding, isProcessingPayment, paidUser]);

  // Debug: Force show app for logged in users
  useEffect(() => {
    if ((user || (isGuest && guestUser)) && currentPage === 'landing') {
      setCurrentPage('app');
    }
  }, [user, guestUser, isGuest, currentPage]);

  const handleGetStarted = () => {
    navigate('/payment');
  };

  const handleAuthAction = (action: 'signin' | 'signup') => {
    if (action === 'signin') navigate('/login');
    if (action === 'signup') navigate('/payment');
  };

  const handleHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setForceShowLanding(true);
    window.scrollTo(0, 0);
  };

  const handleLogoClick = () => {
    setCurrentPage('landing');
    setForceShowLanding(true);
    setShowTopics(true);
    setSelectedTopic(null);
    setPaidUser(false); // Reset paid user status when going back to landing
    window.scrollTo(0, 0);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setShowTopics(false);
  };

  const handleBackToTopics = () => {
    setShowTopics(true);
    setSelectedTopic(null);
  };

  const handleSignOut = async () => {
    if (isGuest) {
      // Clear guest data
      localStorage.removeItem('guest_user_data');
      localStorage.removeItem('last_account_prompt');
      window.location.reload();
    } else {
      await signOut();
    }
    setCurrentPage('landing');
    setPaidUser(false); // Reset paid user status on sign out
  };

  if (loading || isProcessingPayment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <div className="text-slate-600 dark:text-slate-400">
            {isProcessingPayment ? 'Setting up your account...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users or when forceShowLanding is true
  if (currentPage === 'landing' || (!user && !(isGuest && guestUser))) {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onHowItWorks={handleHowItWorks}
        onAuthAction={handleAuthAction}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (currentPage === 'auth') {
    return <AuthPage onBack={handleBackToLanding} initialMode={authMode} />;
  }

  if (currentPage === 'payment') {
    return <PaymentPageWrapper />;
  }

  if (currentPage === 'app' && (user || (isGuest && guestUser)) && !forceShowLanding) {
    const currentUser = user || guestUser;
    
    // Show WelcomeToChatbot after payment, until user clicks the button
    if (paidUser && !showChatbot) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <WelcomeToChatbot onStartChat={() => {
            setShowChatbot(true);
            setActiveTab('chatbot');
          }} />
        </div>
      );
    }

    // For existing paid users, show the main app with navigation immediately
    // Main app with bottom navigation
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20">
        {/* App Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
                onClick={handleLogoClick}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CT</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">ChristTask</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{currentUser?.email}</span>
                  {isGuest && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                      Guest
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content based on activeTab */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'home' && (
            <div className="space-y-8">
              <section className="max-w-7xl mx-auto py-12 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Debate AI Chat Card */}
                  <div className="bg-[#111111] rounded-2xl shadow-xl hover:shadow-2xl border border-gray-700 p-6 text-white transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Debate AI Chat</h3>
                      <p className="text-sm text-gray-300 mb-4">Defend Christianity from challenges and questions.</p>
                    </div>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-4 transition-all duration-300"
                      onClick={() => window.location.href = '/chatbot/defender'}
                    >
                      Open Bot
                    </button>
                  </div>
                  {/* Life Coach Chat Card */}
                  <div className="bg-[#111111] rounded-2xl shadow-xl hover:shadow-2xl border border-gray-700 p-6 text-white transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Life Coach Chat</h3>
                      <p className="text-sm text-gray-300 mb-4">Get practical advice, encouragement, and biblical wisdom for life.</p>
                    </div>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-4 transition-all duration-300"
                      onClick={() => window.location.href = '/chatbot/lifecoach'}
                    >
                      Open Bot
                    </button>
                  </div>
                </div>
              </section>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to ChristTask
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Choose a topic to start your apologetics journey
                </p>
                <Button
                  onClick={() => setActiveTab('chatbot')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Start Direct Chat
                </Button>
              </div>
              <TopicCategories onTopicSelect={handleTopicSelect} />
            </div>
          )}
          {activeTab === 'chatbot' && (
            <ChatbotSuite selectedTopic={selectedTopic} />
          )}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Profile & Settings
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Manage your account and personal settings here.
                </p>
              </div>
              {/* Add profile content here */}
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar - REMOVED: This should be handled by App.tsx with auth checks */}
        {/* <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} /> */}
      </div>
    );
  }

  // Fallback to landing page
  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      onHowItWorks={handleHowItWorks}
      onAuthAction={handleAuthAction}
      onLogoClick={handleLogoClick}
    />
  );
};

export default Index;
