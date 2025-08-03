import { supabase } from '@/integrations/supabase/client';

export interface AccessCheckResult {
  hasAccess: boolean;
  reason: 'authenticated' | 'paid' | 'none';
  userEmail?: string;
  subscriptionStatus?: string;
}

export const checkUserAccess = async (): Promise<AccessCheckResult> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session check error:', sessionError);
      return { hasAccess: false, reason: 'none' };
    }

    // If user is authenticated, check their subscription
    if (session?.user) {
      const userEmail = session.user.email;
      
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
        return {
          hasAccess: true,
          reason: 'paid',
          userEmail,
          subscriptionStatus: 'legacy_paid'
        };
      }

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
      return {
        hasAccess: true,
        reason: 'paid',
        userEmail: paidUserEmail,
        subscriptionStatus: 'guest_paid'
      };
    }

    return { hasAccess: false, reason: 'none' };
    
  } catch (error) {
    console.error('Access check error:', error);
    return { hasAccess: false, reason: 'none' };
  }
}; 