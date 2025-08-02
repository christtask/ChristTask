
import { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useTikTokDetection } from './useTikTokDetection';
import { checkUserAccess, AccessCheckResult } from '@/services/accessCheck';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  hasPaidAccess: () => boolean;
  accessCheckResult: AccessCheckResult | null;
  refreshAccessCheck: () => Promise<void>;
}

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessCheckResult, setAccessCheckResult] = useState(null);
  const { isTikTokBrowser, isInAppBrowser } = useTikTokDetection();

  const performAccessCheck = async () => {
    try {
      const result = await checkUserAccess();
      setAccessCheckResult(result);
      logger.info('Access check result:', result);
    } catch (error) {
      logger.error('Access check failed:', error);
      setAccessCheckResult({ hasAccess: false, reason: 'none' });
    }
  };

  const refreshAccessCheck = async () => {
    await performAccessCheck();
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Perform access check when auth state changes
        performAccessCheck();
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Perform initial access check
      performAccessCheck();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Perform access check when TikTok detection changes
  useEffect(() => {
    if (isTikTokBrowser || isInAppBrowser) {
      performAccessCheck();
    }
  }, [isTikTokBrowser, isInAppBrowser]);

  const testConnection = async () => {
    try {
      logger.info('Testing Supabase connection...');
      
      // First try a simple ping
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        logger.error('Supabase connection test failed:', error);
        return false;
      }
      logger.info('Supabase connection test successful');
      return true;
    } catch (err) {
      logger.error('Supabase connection test exception:', err);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      logger.info('Starting signup process...');
      logger.info('Email:', email);
      
      // Create user - email confirmation should now be disabled in Supabase
      const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email
        }
      }
    });

      logger.info('Signup response:', { data, error });

      if (error) {
        logger.error('Signup error:', error);
        return { data: null, error };
      }

      // User should be created with session immediately (no email confirmation)
      return { data, error: null };
    } catch (err) {
      logger.error('Signup exception:', err);
      return { 
        data: null, 
        error: { 
          message: 'Network error or service unavailable. Please try again.' 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      logger.info('Starting signin process...');
      logger.info('Email:', email);
      logger.info('Password length:', password.length);
      
      // Log environment variables (without exposing sensitive data)
      logger.info('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
      logger.info('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
      
      logger.info('Signin response:', { 
        data: data ? { user: data.user?.id, session: !!data.session } : null, 
        error 
      });

      if (error) {
        logger.error('Signin error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Provide more specific error messages
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          userFriendlyMessage = 'Too many login attempts. Please wait a moment before trying again.';
        } else if (error.status === 400) {
          userFriendlyMessage = 'Invalid request. Please check your email and password format.';
        }
        
        return { 
          data: null, 
          error: { 
            ...error, 
            message: userFriendlyMessage 
          } 
        };
      }

      return { data, error: null };
    } catch (err) {
      logger.error('Signin exception:', err);
      return { 
        data: null, 
        error: { 
          message: 'Network error or service unavailable. Please try again.' 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Signout error:', error);
      }
      // Clear any fallback payment data
      localStorage.removeItem('paymentSuccess');
      localStorage.removeItem('paidUserEmail');
    } catch (err) {
      logger.error('Signout exception:', err);
    }
  };

  const hasPaidAccess = () => {
    // For TikTok and in-app browsers, use backend check
    if (isTikTokBrowser || isInAppBrowser) {
      return accessCheckResult?.hasAccess || false;
    }
    
    // For regular browsers, use localStorage (existing behavior)
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    const paidUserEmail = localStorage.getItem('paidUserEmail');
    
    const hasAccess = paymentSuccess === 'true' && !!paidUserEmail;
    
    // Debug logging
    logger.info('hasPaidAccess check:', {
      paymentSuccess,
      paidUserEmail,
      hasAccess,
      paymentSuccessType: typeof paymentSuccess,
      paidUserEmailType: typeof paidUserEmail,
      isTikTokBrowser,
      isInAppBrowser,
      backendResult: accessCheckResult
    });
    
    return hasAccess;
  };

  const value = {
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      testConnection,
      hasPaidAccess,
      accessCheckResult,
      refreshAccessCheck
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
