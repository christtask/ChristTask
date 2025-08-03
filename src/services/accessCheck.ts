import { supabase } from '@/integrations/supabase/client';
import { getValidSession, debugAuthState } from '@/utils/auth';

export interface AccessCheckResult {
  hasAccess: boolean;
  reason: 'authenticated' | 'paid' | 'none';
  userEmail?: string;
  subscriptionStatus?: string;
}

export const checkUserAccess = async (): Promise<AccessCheckResult> => {
  try {
    // Debug current auth state
    await debugAuthState();
    
    // Get current session with proper validation
    const session = await getValidSession();
    
    if (!session) {
      console.log('No valid session found');
      return { hasAccess: false, reason: 'none' };
    }

    const userEmail = session.user.email;
    console.log('User authenticated:', { userId: session.user.id, email: userEmail });

    // If user is authenticated, check their subscription
    if (session?.user) {
      try {
        // Check if user has an active subscription
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('subscribed', true)
          .limit(1);

        if (subError) {
          console.error('Subscription check error:', subError);
          // If it's a 401 error, the user might not have proper permissions
          if (subError.code === 'PGRST301' || subError.message?.includes('401')) {
            console.warn('User not authorized to access subscriptions table');
            // Fall back to authenticated access
            return {
              hasAccess: true,
              reason: 'authenticated',
              userEmail
            };
          }
        }

        if (subscriptions && subscriptions.length > 0) {
          console.log('User has active subscription');
          return {
            hasAccess: true,
            reason: 'paid',
            userEmail,
            subscriptionStatus: subscriptions[0].subscribed ? 'active' : 'inactive'
          };
        }
      } catch (subscriptionError) {
        console.error('Subscription query failed:', subscriptionError);
        // Fall back to authenticated access if subscription check fails
        return {
          hasAccess: true,
          reason: 'authenticated',
          userEmail
        };
      }

      // Check if user has paid access (fallback for existing users)
      const paymentSuccess = localStorage.getItem('paymentSuccess');
      const paidUserEmail = localStorage.getItem('paidUserEmail');
      
      if (paymentSuccess === 'true' && paidUserEmail === userEmail) {
        console.log('User has legacy paid access');
        return {
          hasAccess: true,
          reason: 'paid',
          userEmail,
          subscriptionStatus: 'legacy_paid'
        };
      }

      console.log('User has authenticated access');
      return {
        hasAccess: true,
        reason: 'authenticated',
        userEmail
      };
    }

    // Check for guest payment access
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    const paidUserEmail = localStorage.getItem('paidUserEmail');
    
    if (paymentSuccess === 'true' && paidUserEmail) {
      console.log('Guest has paid access');
      return {
        hasAccess: true,
        reason: 'paid',
        userEmail: paidUserEmail,
        subscriptionStatus: 'guest_paid'
      };
    }

    console.log('No access found');
    return { hasAccess: false, reason: 'none' };
    
  } catch (error) {
    console.error('Access check error:', error);
    return { hasAccess: false, reason: 'none' };
  }
}; 