
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  hasPaidAccess: () => boolean;
}

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // First try a simple ping
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      console.log('Supabase connection test successful');
      return true;
    } catch (err) {
      console.error('Supabase connection test exception:', err);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Starting signup process...');
      console.log('Email:', email);
      
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

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }

      // User should be created with session immediately (no email confirmation)
      return { data, error: null };
    } catch (err) {
      console.error('Signup exception:', err);
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
      console.log('Starting signin process...');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      
      // Log environment variables (without exposing sensitive data)
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
      console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
      
      console.log('Signin response:', { 
        data: data ? { user: data.user?.id, session: !!data.session } : null, 
        error 
      });

      if (error) {
        console.error('Signin error details:', {
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
      console.error('Signin exception:', err);
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
        console.error('Signout error:', error);
      }
      // Clear any fallback payment data
      localStorage.removeItem('paymentSuccess');
      localStorage.removeItem('paidUserEmail');
    } catch (err) {
      console.error('Signout exception:', err);
    }
  };

  const hasPaidAccess = () => {
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    const paidUserEmail = localStorage.getItem('paidUserEmail');
    
    return paymentSuccess === 'true' && !!paidUserEmail;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    testConnection,
    hasPaidAccess
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
