
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface GuestAuthContextType {
  isGuest: boolean;
  guestUser: User | null;
  handleGuestSuccess: (sessionId: string) => Promise<void>;
  promoteGuestToFullAccount: (password: string) => Promise<{ error: any }>;
  skipAccountCreation: () => void;
  showAccountPrompt: boolean;
  retryGuestSetup: (sessionId: string) => Promise<void>;
}

const GuestAuthContext = createContext<GuestAuthContextType | undefined>(undefined);

export const GuestAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [guestUser, setGuestUser] = useState<User | null>(null);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a guest user in localStorage
    const guestData = localStorage.getItem('guest_user_data');
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        setGuestUser(parsed.user);
        setIsGuest(true);
        // Show account prompt after 24 hours or on app restart
        const lastPrompt = localStorage.getItem('last_account_prompt');
        const now = Date.now();
        if (!lastPrompt || now - parseInt(lastPrompt) > 24 * 60 * 60 * 1000) {
          setShowAccountPrompt(true);
        }
      } catch (error) {
        console.error('Error parsing guest data:', error);
        localStorage.removeItem('guest_user_data');
      }
    }
  }, []);

  const handleGuestSuccess = async (sessionId: string) => {
    try {
      logger.log('Processing guest success for session:', sessionId);
      
      const { data, error } = await supabase.functions.invoke('handle-guest-success', {
        body: { sessionId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to process guest account');
      }

      if (!data || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store guest user data
      localStorage.setItem('guest_user_data', JSON.stringify({
        user: data.user,
        created_at: Date.now()
      }));

      setGuestUser(data.user);
      setIsGuest(true);
      setShowAccountPrompt(true);

      logger.log('Guest account setup successful');

    } catch (error) {
      console.error('Error handling guest success:', error);
      
      // Show a more specific error with retry option
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Account setup failed",
        description: `${errorMessage}. Please try refreshing the page or contact support if the issue persists.`,
        variant: "destructive",
        duration: 10000, // Longer duration for error messages
      });
      
      throw error; // Re-throw so the calling code can handle it
    }
  };

  const retryGuestSetup = async (sessionId: string) => {
    return handleGuestSuccess(sessionId);
  };

  const promoteGuestToFullAccount = async (password: string) => {
    if (!guestUser?.email) return { error: "No guest user found" };

    try {
      // First, try to sign in the user with a recovery link approach
      // Since we don't have their current password, we'll use the admin recovery function
      const { data, error: recoveryError } = await supabase.functions.invoke('promote-guest-account', {
        body: { 
          email: guestUser.email,
          newPassword: password
        }
      });

      if (recoveryError) throw recoveryError;

      // Clear guest data and update state
      localStorage.removeItem('guest_user_data');
      localStorage.removeItem('last_account_prompt');
      setIsGuest(false);
      setShowAccountPrompt(false);

      toast({
        title: "Account created!",
        description: "Your account has been secured. Please sign in with your email and new password.",
      });

      // Refresh the page to reset the auth state
      window.location.reload();

      return { error: null };
    } catch (error) {
      console.error('Error promoting guest account:', error);
      return { error: error instanceof Error ? error : new Error('Failed to create account') };
    }
  };

  const skipAccountCreation = () => {
    localStorage.setItem('last_account_prompt', Date.now().toString());
    setShowAccountPrompt(false);
  };

  return (
    <GuestAuthContext.Provider value={{
      isGuest,
      guestUser,
      handleGuestSuccess,
      promoteGuestToFullAccount,
      skipAccountCreation,
      showAccountPrompt,
      retryGuestSetup
    }}>
      {children}
    </GuestAuthContext.Provider>
  );
};

export const useGuestAuth = () => {
  const context = useContext(GuestAuthContext);
  if (context === undefined) {
    throw new Error('useGuestAuth must be used within a GuestAuthProvider');
  }
  return context;
};
