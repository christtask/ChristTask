import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';

export const BackendTest = () => {
  const [results, setResults] = useState([] as string[]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendHealth = async () => {
    setLoading(true);
    addResult('Testing backend health...');
    
    try {
      const response = await fetch('https://christtask-backend.onrender.com/');
      const data = await response.json();
      addResult(`✅ Health check: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Health check failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentEndpoints = async () => {
    setLoading(true);
    addResult('Testing payment endpoints...');
    
    const endpoints = [
      '/create-subscription',
      '/check-subscription',
      '/webhook'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`https://christtask-backend.onrender.com${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        addResult(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        addResult(`❌ ${endpoint}: ${error}`);
      }
    }
    
    setLoading(false);
  };

  const testSubscriptionCreation = async () => {
    setLoading(true);
    addResult('Testing subscription creation...');
    
    try {
      const response = await fetch('https://christtask-backend.onrender.com/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          plan: 'monthly',
          paymentMethodId: 'pm_test_123'
        })
      });
      
      const data = await response.json();
      addResult(`✅ Subscription test: ${response.status} - ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Subscription test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Backend Payment Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testBackendHealth} disabled={loading}>
              Test Health
            </Button>
            <Button onClick={testPaymentEndpoints} disabled={loading}>
              Test Payment Endpoints
            </Button>
            <Button onClick={testSubscriptionCreation} disabled={loading}>
              Test Subscription Creation
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {results.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click a button above to start testing.</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 