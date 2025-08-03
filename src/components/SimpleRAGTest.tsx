import React, { useState } from 'react';

export const SimpleRAGTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testBackend = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('Testing backend connection...');
      
      // Test the health endpoint first
      const healthResponse = await fetch('https://christtask-backend.onrender.com/');
      const healthData = await healthResponse.json();
      console.log('Health check:', healthData);

      // Test the RAG endpoint
      const ragResponse = await fetch('https://christtask-backend.onrender.com/api/test-rag');
      const ragData = await ragResponse.json();
      console.log('RAG test:', ragData);

      setResponse(JSON.stringify({ health: healthData, rag: ragData }, null, 2));
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testChat = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('Testing chat with message:', message);
      
      const response = await fetch('https://christtask-backend.onrender.com/api/test-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      console.log('Chat response:', data);

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Chat test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>RAG Backend Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBackend} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Backend Connection
        </button>
        
        <button 
          onClick={testChat} 
          disabled={loading || !message.trim()}
          style={{ 
            padding: '10px 20px',
            backgroundColor: (loading || !message.trim()) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (loading || !message.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          Test Chat
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="testMessage" style={{ display: 'block', marginBottom: '5px' }}>Test Message:</label>
        <textarea
          id="testMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a test message..."
          rows={3}
          style={{ 
            width: '100%', 
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        />
      </div>

      {loading && (
        <div style={{ color: '#007bff', marginBottom: '10px' }}>Testing...</div>
      )}

      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          Error: {error}
        </div>
      )}

      {response && (
        <div>
          <label htmlFor="response" style={{ display: 'block', marginBottom: '5px' }}>Response:</label>
          <pre 
            id="response"
            style={{ 
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '400px',
              border: '1px solid #dee2e6'
            }}
          >
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}; 