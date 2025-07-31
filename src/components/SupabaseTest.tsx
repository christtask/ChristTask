import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const SupabaseTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check environment variables
      addResult('Testing environment variables...');
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      addResult(`Supabase URL: ${hasUrl ? 'Present' : 'Missing'}`);
      addResult(`Supabase Key: ${hasKey ? 'Present' : 'Missing'}`);
      
      if (!hasUrl || !hasKey) {
        addResult('❌ Environment variables are missing!');
        return;
      }
      
      // Test 2: Check Supabase client
      addResult('Testing Supabase client...');
      addResult(`Supabase URL: ${supabase.supabaseUrl}`);
      addResult(`Supabase Key: ${supabase.supabaseKey ? 'Present' : 'Missing'}`);
      
      // Test 3: Test basic connection
      addResult('Testing basic connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
        addResult(`Error code: ${error.code}`);
        addResult(`Error details: ${JSON.stringify(error)}`);
      } else {
        addResult('✅ Basic connection successful');
      }
      
      // Test 4: Test auth endpoints
      addResult('Testing auth endpoints...');
      try {
        const authResponse = await fetch(`${supabase.supabaseUrl}/auth/v1/health`, {
          method: 'GET',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        });
        
        if (authResponse.ok) {
          addResult('✅ Auth endpoints accessible');
        } else {
          addResult(`❌ Auth endpoints failed: ${authResponse.status} ${authResponse.statusText}`);
        }
      } catch (err) {
        addResult(`❌ Auth endpoints error: ${err}`);
      }
      
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      
      <Button 
        onClick={runTests} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Running Tests...' : 'Run Connection Tests'}
      </Button>
      
      {testResults.length > 0 && (
        <div className="space-y-1">
          <h4 className="font-medium">Test Results:</h4>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 