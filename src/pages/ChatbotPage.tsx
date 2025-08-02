import RAGChatbotSimple from '../components/RAGChatbotSimple';
import { logger } from '../utils/logger';

export default function ChatbotPage() {
  logger.info('ChatbotPage rendered');
  
  // Show chatbot directly without any authentication checks
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Show chatbot */}
      <RAGChatbotSimple />
    </div>
  );
} 