import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  showLoading: (message?: string, duration?: number) => void;
  hideLoading: () => void;
  loadingMessage: string;
  loadingDuration: number;
}

export const useLoading = (): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingDuration, setLoadingDuration] = useState(3000);

  const showLoading = useCallback((message = "Preparing your ChristTask experience...", duration = 3000) => {
    setLoadingMessage(message);
    setLoadingDuration(duration);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    showLoading,
    hideLoading,
    loadingMessage,
    loadingDuration
  };
}; 