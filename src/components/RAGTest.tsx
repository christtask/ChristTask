import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export const RAGTest: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>RAG Backend Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testBackend} disabled={loading}>
                Test Backend Connection
              </Button>
              <Button onClick={testChat} disabled={loading || !message.trim()}>
                Test Chat
              </Button>
            </div>
            
            <div>
              <label htmlFor="testMessage" className="block text-sm font-medium mb-2">Test Message:</label>
              <Textarea
                id="testMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a test message..."
                rows={3}
              />
            </div>

            {loading && (
              <div className="text-blue-600">Testing...</div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">
                Error: {error}
              </div>
            )}

            {response && (
              <div>
                <label htmlFor="response" className="block text-sm font-medium mb-2">Response:</label>
                <pre id="response" className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {response}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 