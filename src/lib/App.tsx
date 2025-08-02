import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentPageWrapper from "../pages/PaymentPageWrapper";
import DemoPaymentPage from "../pages/DemoPaymentPage";
import { LandingPage } from "../components/LandingPage";
import { ChatInterface } from "../components/ChatInterface";
import { WelcomeToChatbot } from "../components/WelcomeToChatbot";
import { BiblePage } from "../components/BiblePage";
import { ChatbotSuite } from "../components/ChatbotSuite";
import { AIChatbotTest } from "../components/AIChatbotTest";
import { RAGTest } from "../components/RAGTest";
import { SimpleRAGTest } from "../components/SimpleRAGTest";
import { useState, useEffect } from 'react';
import { SidebarNavigation } from '../components/SidebarNavigation';
import { BottomNavigation } from '../components/BottomNavigation';
import ChatbotPage from '../pages/ChatbotPage';
import { AuthPage } from "../components/AuthPage";
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/use-mobile';
import { LoadingScreen } from '../components/LoadingScreen';
import { BackendTest } from '../components/BackendTest';
import { isTikTokBrowser } from '../utils/browserDetection';
import NotFound from '../pages/NotFound';
import { logger } from '../utils/logger';

const stripePromise = loadStripe("pk_live_51RZvWwFEfjI8S6GYRjyPtWWfSZ0iQEAEQ3oMfKSsjtBP5h47m7G2HvnpKEyXYJNZ9WyvCVcl1TJTSRNQMvaQju6d00YaYe3dhu");

function AppRoutes({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const navigate = useNavigate();
  const { user, hasPaidAccess } = useAuth();
  
  // Check if user has access
  const hasAccess = user || hasPaidAccess();
  
  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!hasAccess) {
      // Redirect to home page if no access
      navigate('/');
      return null;
    }
    return <>{children}</>;
  };
  
  return (
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/payment')} onHowItWorks={() => {}} onAuthAction={() => {}} onLogoClick={() => {}} />} />
        <Route path="/payment" element={<PaymentPageWrapper />} />
        <Route path="/demo-payment" element={<DemoPaymentPage />} />
        <Route path="/success" element={<WelcomeToChatbot onStartChat={() => navigate('/chatbot')} />} />
        <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
        <Route path="/chatbot-simple" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
        <Route path="/bible" element={<ProtectedRoute><BiblePage /></ProtectedRoute>} />
        <Route path="/forum" element={
          <ProtectedRoute>
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
              <div className="text-white text-2xl font-semibold">Forum Coming Soon...</div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<AuthPage initialMode="signin" onBack={() => navigate('/')} />} />
        <Route path="/privacy-policy" element={<div className="min-h-screen p-8"><h1 className="text-2xl font-bold mb-4">Privacy Policy</h1><p>Coming soon...</p></div>} />
        <Route path="/terms-of-service" element={<div className="min-h-screen p-8"><h1 className="text-2xl font-bold mb-4">Terms of Service</h1><p>Coming soon...</p></div>} />
        <Route path="/refund-policy" element={<div className="min-h-screen p-8"><h1 className="text-2xl font-bold mb-4">Refund Policy</h1><p>Coming soon...</p></div>} />
        <Route path="/contact" element={<div className="min-h-screen p-8"><h1 className="text-2xl font-bold mb-4">Contact Us</h1><p>Coming soon...</p></div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // Add navigation loading state
  const navigate = useNavigate();
  const { user, loading, hasPaidAccess } = useAuth();
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const isMobile = useIsMobile();

  // Check access based on browser type
  useEffect(() => {
    async function checkAccess() {
      if (isTikTokBrowser()) {
        // Don't trust local storage, ask backend
        try {
          const res = await fetch('/api/check-access', { 
            cache: 'no-store',
            headers: {
              'x-payment-success': localStorage.getItem('paymentSuccess') || '',
              'x-paid-user-email': localStorage.getItem('paidUserEmail') || ''
            }
          });
          const data = await res.json();
          setShowBottomNav(data.hasAccess);
        } catch (error) {
          setShowBottomNav(false);
        }
      } else {
        // Your existing logic (local/session access)
        const hasAccess = user || hasPaidAccess();
        setShowBottomNav(hasAccess);
      }
    }

    if (!loading && !isNavigating) {
      checkAccess();
    }
  }, [user, loading, hasPaidAccess, isNavigating]);

  // Track if user was previously authenticated
  useEffect(() => {
    if (user && !wasAuthenticated) {
      setWasAuthenticated(true);
    }
  }, [user, wasAuthenticated]);

  // Redirect to home page only when user logs out from authenticated state
  useEffect(() => {
    if (!loading && wasAuthenticated && !user) {
      navigate('/');
      setWasAuthenticated(false);
    }
  }, [user, loading, navigate, wasAuthenticated]);

  const handleTabChange = (tab) => {
    setIsNavigating(true); // Set navigation loading state
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'chatbot':
        navigate('/chatbot');
        break;
      case 'bible':
        navigate('/bible');
        break;
      case 'forum':
        navigate('/forum');
        break;
      default:
        break;
    }
    // Clear navigation loading state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  };

  // Show loading state while checking authentication or during navigation
  if (loading || isNavigating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user doesn't have access, show only the routes without navigation
  if (!showBottomNav) {
    return (
      <div className="min-h-screen">
        <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  // Show responsive navigation only for users with access
  return (
    <div className="flex min-h-screen h-screen">
      {/* Desktop Sidebar Navigation */}
      {!isMobile && (
        <SidebarNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onCollapseChange={setSidebarCollapsed}
        />
      )}
      
      {/* Main Content Area */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${
        isMobile ? 'pb-20' : ''
      }`}>
        <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Mobile Bottom Navigation - Only show for users with access */}
        {isMobile && showBottomNav && (
          <>
            <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
