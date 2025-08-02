import { useState, useEffect } from 'react';

export const useTikTokDetection = () => {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const detectTikTokBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const url = window.location.href.toLowerCase();
      
      // TikTok in-app browser detection
      const isTikTok = userAgent.includes('tiktok') || 
                       userAgent.includes('bytedance') ||
                       url.includes('tiktok.com') ||
                       url.includes('musical.ly');
      
      // General in-app browser detection
      const isInApp = userAgent.includes('wv') || // Android WebView
                      userAgent.includes('mobile') && userAgent.includes('safari') && !userAgent.includes('chrome') || // iOS WebView
                      userAgent.includes('instagram') ||
                      userAgent.includes('facebook') ||
                      userAgent.includes('snapchat') ||
                      userAgent.includes('whatsapp') ||
                      isTikTok;
      
      setIsTikTokBrowser(isTikTok);
      setIsInAppBrowser(isInApp);
      
      console.log('Browser Detection:', {
        userAgent: userAgent,
        isTikTok,
        isInApp,
        url: window.location.href
      });
    };

    detectTikTokBrowser();
  }, []);

  return { isTikTokBrowser, isInAppBrowser };
}; 