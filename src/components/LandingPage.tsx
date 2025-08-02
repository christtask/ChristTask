// @ts-nocheck - Temporary disable for missing dependencies
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { OrganicWaveDivider } from "@/components/OrganicWaveDivider";
import { HeroSection } from "@/components/HeroSection";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  MessageSquare, 
  Shield, 
  BookOpen, 
  Users, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Star,
  Brain,
  Cross,
  ExternalLink,
  Heart,
  Globe,
  Book,
  Video,
  Mic,
  LogOut
} from "lucide-react";
import { logger } from '@/utils/logger';

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [elementRef, isVisible];
};

interface LandingPageProps {
  onGetStarted: () => void;
  onHowItWorks: () => void;
  onAuthAction: (action: 'signin' | 'signup') => void;
  onLogoClick: () => void;
}

export const LandingPage = ({ 
  onGetStarted, 
  onHowItWorks, 
  onAuthAction, 
  onLogoClick 
}: LandingPageProps) => {
  const navigate = useNavigate();
  const [headingRef, isHeadingVisible] = useScrollAnimation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  // Debug logging
  logger.log('LandingPage - menuOpen:', menuOpen, 'isMobile:', isMobile);

  const handleStartJourney = () => {
    navigate('/payment');
  };

  const handleHowItWorks = () => {
    navigate('/how-it-works');
  };

  const handleLogOut = async () => {
    await signOut();
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const [selectedPlan, setSelectedPlan] = useState('weekly');

  return (
    <>
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={onLogoClick}
            >
              <h1 className="text-2xl font-bold text-white">ChristTask</h1>
            </div>
            {/* Hamburger Icon - always visible top right */}
            <div ref={menuRef} className="flex items-center absolute right-4 top-4 z-[9999] space-x-4">
              {user && isMobile && (
                <button
                  onClick={handleLogOut}
                  className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => window.location.href = '/login'}
                className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                Login
              </button>
              <button
                className="text-white focus:outline-none"
                onClick={() => {
                  logger.log('Hamburger clicked! Current menuOpen:', menuOpen);
                  setMenuOpen(!menuOpen);
                  logger.log('MenuOpen set to:', !menuOpen);
                }}
                aria-label="Open menu"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Mobile Dropdown Menu */}
              {menuOpen && (
                <div 
                  className="absolute top-12 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-lg flex flex-col w-48 py-2 z-[9999]"
                  style={{ display: menuOpen ? 'flex' : 'none' }}
                >
                  <button 
                    onClick={() => { 
                      logger.log('Home clicked');
                      setMenuOpen(false); 
                      navigate('/'); 
                    }} 
                    className="text-white px-4 py-2 text-left hover:bg-gray-800 transition-colors"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { 
                      logger.log('Chat with AI clicked');
                      setMenuOpen(false); 
                      navigate('/payment'); 
                    }} 
                    className="text-white px-4 py-2 text-left hover:bg-gray-800 transition-colors"
                  >
                    Chat with AI
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection 
        onGetStarted={handleStartJourney}
        onHowItWorks={handleHowItWorks}
        variant="landing"
      />

      {/* Organic Wave Divider - Hero */}
      <OrganicWaveDivider variant="horizontal" />

      {/* Features Section */}
      <section className="mt-16 py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Removed 'Have the perfect answer, Every time' heading */}
          <div className="flex justify-between items-center mb-16 w-full">
            <h2 
              ref={headingRef}
              className={`text-2xl md:text-4xl font-bold text-white mb-0 transition-all duration-1000 ease-out ${
                isHeadingVisible 
                  ? 'opacity-100 transform translate-x-0' 
                  : 'opacity-0 transform -translate-x-20'
              }`}
            >
              All the tools you need in<br />one place...
            </h2>
            <div className="flex flex-col items-end">
              <span className="text-gray-300 text-right text-base md:text-lg font-semibold mr-[5.5cm]">- Can't answer on time?</span>
              <span className="text-gray-300 text-right text-base md:text-lg font-semibold mt-1 mr-[3cm]">- Afraid of quoting scripture wrong?</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover-lift animate-slide-in-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Biblical Defense</h3>
                <p className="text-blue-200">
                  Get Scripture-backed responses to defend your faith against common objections and challenges.
              </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover-lift animate-fade-in-up">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Answers</h3>
                <p className="text-blue-200">
                  AI-powered responses in seconds, helping you engage in meaningful conversations about faith.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover-lift animate-slide-in-right">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Deep Knowledge</h3>
                <p className="text-blue-200">
                  Access comprehensive apologetics knowledge covering theology, philosophy, and biblical studies.
            </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organic Wave Divider - Two Dips */}
      <OrganicWaveDivider variant="horizontal" />

      {/* Testimonials Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Join thousands of Christians who have strengthened their faith with ChristTask
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="testimonial-card bg-white/10 backdrop-blur-sm border-white/20 text-white animate-slide-in-left">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-blue-500 text-white">SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Sarah Mitchell</h4>
                    <p className="text-blue-200 text-sm">Youth Pastor</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-200 italic">
                  "ChristTask has been invaluable for my youth group. The AI provides thoughtful, 
                  Scripture-based answers that help our teens defend their faith with confidence."
                </p>
              </CardContent>
            </Card>

            <Card className="testimonial-card bg-white/10 backdrop-blur-sm border-white/20 text-white animate-fade-in-up">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-purple-500 text-white">MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Michael Johnson</h4>
                    <p className="text-blue-200 text-sm">College Student</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-200 italic">
                  "As a college student, I face challenging questions about my faith daily. 
                  ChristTask gives me the tools and confidence to engage in meaningful discussions."
                </p>
              </CardContent>
            </Card>

            <Card className="testimonial-card bg-white/10 backdrop-blur-sm border-white/20 text-white animate-slide-in-right">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-indigo-500 text-white">DL</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">David Lee</h4>
                    <p className="text-blue-200 text-sm">Small Group Leader</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-200 italic">
                  "The depth of knowledge and biblical accuracy is impressive. 
                  It's like having a theology professor available 24/7 for our small group discussions."
            </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organic Wave Divider */}
      <OrganicWaveDivider variant="horizontal" />

      {/* Payment Section */}
      <section className="flex flex-col items-center justify-center py-20" style={{ background: '#0a0a0a' }}>
        <div className="mb-8 text-center w-full" style={{ fontFamily: 'Inter, \'Helvetica Neue\', Arial, sans-serif' }}>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
            One payment, full access.
          </h2>
          <p className="text-lg md:text-xl font-normal" style={{ color: '#888888' }}>
            Straightforward pricing - one payment grants you access to our whole suite.
          </p>
        </div>
        {/* Toggle Switch above the box */}
        <div className="flex justify-center items-center mb-[30px] gap-4 w-full">
          <span className={`font-medium text-base transition-colors duration-200 ${selectedPlan === 'weekly' ? 'text-[#8B5CF6]' : 'text-[#888888]'}`}>Weekly</span>
          <button
            className="relative w-16 h-9 rounded-full transition-colors duration-200 focus:outline-none"
            style={{ background: '#0a0a0a', border: '1px solid #222' }}
            onClick={() => setSelectedPlan(selectedPlan === 'weekly' ? 'monthly' : 'weekly')}
            aria-label="Toggle plan"
            type="button"
          >
            <span
              className={`absolute top-1 left-1 w-7 h-7 rounded-full shadow-md transform transition-transform duration-200 ${selectedPlan === 'monthly' ? 'translate-x-7' : ''}`}
              style={{ background: '#8B5CF6' }}
            />
          </button>
          <span className={`font-medium text-base transition-colors duration-200 ${selectedPlan === 'monthly' ? 'text-[#8B5CF6]' : 'text-[#888888]'}`}>Monthly</span>
        </div>
        <div className="relative flex flex-col items-center justify-center rounded-2xl" style={{ background: '#1a1a1a', padding: '20px 24px', minWidth: '320px', maxWidth: '480px', width: '100%' }}>
          {/* EXCLUSIVE Badge */}
          <div className="absolute top-0 right-0 mt-4 mr-4 px-4 py-1 rounded-full text-xs font-semibold" style={{ background: '#18181b', color: '#8B5CF6', letterSpacing: '0.08em' }}>EXCLUSIVE</div>
          <div className="flex flex-col w-full">
            <h3 className="mb-6 text-2xl font-medium text-white">Full Access</h3>
            <div className="flex items-end mb-6">
              <span className="text-4xl font-thin text-white">{selectedPlan === 'weekly' ? '£4.50' : '£11.99'}</span>
              <span className="text-base font-normal text-[#888888] ml-2 mb-1">/{selectedPlan === 'weekly' ? 'week' : 'month'}</span>
            </div>
            <p className="text-sm text-[#cccccc] mb-6">Full access to ChristTask's faith-powered tools, Scripture-rooted learning, and community.</p>
            <ul className="text-sm text-[#cccccc] space-y-2 text-left mb-6">
              <li className="flex items-center"><span className="mr-2 text-[#8B5CF6]">&#10003;</span> Unlimited use of all tools</li>
              <li className="flex items-center"><span className="mr-2 text-[#8B5CF6]">&#10003;</span> AI-powered answers</li>
              <li className="flex items-center"><span className="mr-2 text-[#8B5CF6]">&#10003;</span> Private community access</li>
              <li className="flex items-center"><span className="mr-2 text-[#8B5CF6]">&#10003;</span> Priority support</li>
              <li className="flex items-center"><span className="mr-2 text-[#8B5CF6]">&#10003;</span> No hidden fees</li>
            </ul>
            <button
              className="w-full py-3 rounded-full bg-[#8B5CF6] text-white font-bold text-lg shadow-lg hover:bg-purple-700 transition-all duration-300"
              onClick={onGetStarted}
            >
              Get Access Now
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Cross className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">ChristTask</h3>
              </div>
              <p className="text-blue-200 mb-4 max-w-md">
                Empowering Christians with AI-powered apologetics. Defend your faith with confidence 
                using Scripture-backed responses to challenging questions.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white">
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleHowItWorks} 
                          className="resource-link text-blue-200 hover:text-white flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => onAuthAction('signup')} 
                          className="resource-link text-blue-200 hover:text-white flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get Started
                  </button>
                </li>
                <li>
                  <a href="#contact" 
                     className="resource-link text-blue-200 hover:text-white flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-blue-200">
            © 2024 ChristTask. Empowering Christians with AI-powered apologetics.
              Made with <Heart className="w-4 h-4 inline text-red-400" /> for the Kingdom.
          </p>
          </div>
        </div>
      </footer>
    </>
  );
};
