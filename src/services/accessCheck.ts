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
      
      // Check if user has an active subscription
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Subscription check error:', subError);
      }

      if (subscriptions) {
        return {
          hasAccess: true,
          reason: 'paid',
          userEmail,
          subscriptionStatus: subscriptions.status
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