import RAGChatbotSimple from '../components/RAGChatbotSimple';

export default function ChatbotPage() {
  console.log('ChatbotPage rendered');
  
  // Show chatbot directly without any authentication checks
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Show chatbot */}
      <RAGChatbotSimple />
    </div>
  );
} 