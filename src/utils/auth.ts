import { supabase } from '@/integrations/supabase/client';

/**
 * Get the current session and validate it
 */
export const getValidSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return null;
    }
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Session token expired, refreshing...');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Token refresh error:', refreshError);
        return null;
      }
      
      return refreshedSession;
    }
    
    return session;
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
};

/**
 * Get the current access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  const session = await getValidSession();
  return session?.access_token || null;
};

/**
 * Make an authenticated request to Supabase
 */
export const makeAuthenticatedRequest = async <T>(
  requestFn: (token: string) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  try {
    const token = await getAccessToken();
    
    if (!token) {
      return { data: null, error: { message: 'No valid session found' } };
    }
    
    return await requestFn(token);
  } catch (error) {
    console.error('Authenticated request failed:', error);
    return { data: null, error };
  }
};

/**
 * Debug function to log current authentication state
 */
export const debugAuthState = async () => {
  const session = await getValidSession();
  console.log('Current auth state:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    tokenExpiresAt: session?.expires_at,
    isExpired: session?.expires_at ? session.expires_at < Math.floor(Date.now() / 1000) : null
  });
}; 