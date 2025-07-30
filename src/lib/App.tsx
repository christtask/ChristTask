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
import ChatbotPage from '../pages/ChatbotPage';
import { AuthPage } from "../components/AuthPage";
import { useAuth } from '../hooks/useAuth';

const stripePromise = loadStripe("pk_live_51RZvWwFEfjI8S6GYRjyPtWWfSZ0iQEAEQ3oMfKSsjtBP5h47m7G2HvnpKEyXYJNZ9WyvCVcl1TJTSRNQMvaQju6d00YaYe3dhu");

function AppRoutes({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const navigate = useNavigate();
  return (
      <Routes>
      <Route path="/" element={<LandingPage onGetStarted={() => navigate('/payment')} onHowItWorks={() => {}} onAuthAction={() => {}} onLogoClick={() => {}} />} />
        <Route path="/payment" element={<PaymentPageWrapper />} />
        <Route path="/demo-payment" element={<DemoPaymentPage />} />
        <Route path="/success" element={<WelcomeToChatbot onStartChat={() => navigate('/chatbot')} />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/chatbot-simple" element={<ChatbotPage />} />
        <Route path="/chatbot-test" element={<AIChatbotTest />} />
        <Route path="/rag-test" element={<RAGTest />} />
        <Route path="/simple-rag-test" element={<SimpleRAGTest />} />
        <Route path="/bible" element={<BiblePage />} />
        <Route path="/forum" element={<div style={{padding:40, color:'#333', fontSize:24}}>Forum Coming Soon...</div>} />
        <Route path="/login" element={<AuthPage initialMode="signin" onBack={() => navigate('/')} />} />
      </Routes>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

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
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, show only the routes without sidebar
  if (!user) {
    return (
      <div className="min-h-screen">
        <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  // If user is authenticated, show sidebar navigation
  return (
    <div className="flex min-h-screen h-screen">
      <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 overflow-auto">
        <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
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
