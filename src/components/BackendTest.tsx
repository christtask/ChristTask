import React, { useState } from 'react';

export const BackendTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testBackend = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('Testing backend health...');
      
      // Test the health endpoint
      const healthResponse = await fetch('https://christtask-backend.onrender.com/');
      console.log('Health response status:', healthResponse.status);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Health check data:', healthData);
        setResult(`✅ Backend is working! Status: ${healthResponse.status}\nData: ${JSON.stringify(healthData, null, 2)}`);
      } else {
        setResult(`❌ Backend health check failed! Status: ${healthResponse.status}`);
      }

      // Test different possible subscription endpoints
      const endpoints = [
        '/create-subscription',
        '/subscription',
        '/api/create-subscription',
        '/api/subscription',
        '/stripe/create-subscription',
        '/stripe/subscription'
      ];

      setResult(prev => prev + '\n\n🔍 Testing subscription endpoints:');
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing endpoint: ${endpoint}`);
          const response = await fetch(`https://christtask-backend.onrender.com${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
          });
          
          console.log(`${endpoint} status:`, response.status);
          setResult(prev => prev + `\n${endpoint}: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            setResult(prev => prev + ' ✅ WORKING!');
            break;
          }
        } catch (err) {
          console.log(`${endpoint} error:`, err);
          setResult(prev => prev + `\n${endpoint}: ERROR`);
        }
      }
      
    } catch (err: any) {
      console.error('Backend test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Backend Service Test</h2>
      
      <button 
        onClick={testBackend} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test Backend'}
      </button>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          Error: {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {result}
        </div>
      )}
    </div>
  );
}; 