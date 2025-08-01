import { useAuth } from '@/hooks/useAuth';
import RAGChatbotSimple from '../components/RAGChatbotSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ChatbotPage() {
  const { user, hasPaidAccess } = useAuth();
  const navigate = useNavigate();

  // If user is not logged in and doesn't have paid access, redirect to login
  if (!user && !hasPaidAccess()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Please log in to access the chatbot.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in or has paid access, show chatbot
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Show chatbot */}
      <RAGChatbotSimple />
    </div>
  );
} 