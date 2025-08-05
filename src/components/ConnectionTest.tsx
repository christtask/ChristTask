import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ConnectionTest = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults({});

    const results: any = {};

    // Test 1: Environment Variables
    results.envVars = {
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      stripeKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      backendUrl: !!import.meta.env.VITE_BACKEND_URL
    };

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      results.supabase = {
        success: !error,
        error: error?.message || null,
        data: data
      };
    } catch (err: any) {
      results.supabase = {
        success: false,
        error: err.message,
        data: null
      };
    }

    // Test 3: Stripe Configuration
    try {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      results.stripe = {
        success: !!stripeKey && stripeKey.startsWith('pk_'),
        key: stripeKey ? `${stripeKey.substring(0, 10)}...` : 'Missing',
        error: !stripeKey ? 'Missing Stripe key' : 
               !stripeKey.startsWith('pk_') ? 'Invalid key format' : null
      };
    } catch (err: any) {
      results.stripe = {
        success: false,
        error: err.message,
        key: 'Error'
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusColor = (success: boolean) => success ? 'bg-green-500' : 'bg-red-500';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Connection Test
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Testing...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Environment Variables */}
        <div>
          <h3 className="font-semibold mb-2">Environment Variables</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(testResults.envVars?.supabaseUrl)}`} />
              Supabase URL: {testResults.envVars?.supabaseUrl ? '✅ Present' : '❌ Missing'}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(testResults.envVars?.supabaseKey)}`} />
              Supabase Key: {testResults.envVars?.supabaseKey ? '✅ Present' : '❌ Missing'}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(testResults.envVars?.stripeKey)}`} />
              Stripe Key: {testResults.envVars?.stripeKey ? '✅ Present' : '❌ Missing'}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(testResults.envVars?.backendUrl)}`} />
              Backend URL: {testResults.envVars?.backendUrl ? '✅ Present' : '❌ Missing'}
            </div>
          </div>
        </div>

        {/* Supabase Test */}
        {testResults.supabase && (
          <div>
            <h3 className="font-semibold mb-2">Supabase Connection</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(testResults.supabase.success)}`} />
              <span>{testResults.supabase.success ? '✅ Connected' : '❌ Failed'}</span>
              {testResults.supabase.error && (
                <Badge variant="destructive" className="text-xs">
                  {testResults.supabase.error}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stripe Test */}
        {testResults.stripe && (
          <div>
            <h3 className="font-semibold mb-2">Stripe Configuration</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(testResults.stripe.success)}`} />
              <span>{testResults.stripe.success ? '✅ Valid Key' : '❌ Invalid Key'}</span>
              <span className="text-xs text-gray-500">({testResults.stripe.key})</span>
              {testResults.stripe.error && (
                <Badge variant="destructive" className="text-xs">
                  {testResults.stripe.error}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Summary</h4>
            <div className="text-sm space-y-1">
              {testResults.envVars && (
                <div>
                  Environment Variables: {
                    Object.values(testResults.envVars).every(Boolean) 
                      ? '✅ All Present' 
                      : '❌ Missing Some'
                  }
                </div>
              )}
              {testResults.supabase && (
                <div>
                  Supabase: {testResults.supabase.success ? '✅ Working' : '❌ Failed'}
                </div>
              )}
              {testResults.stripe && (
                <div>
                  Stripe: {testResults.stripe.success ? '✅ Configured' : '❌ Invalid'}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 