import { useState, useEffect } from 'react';
import { geolocationService } from '@/services/geolocation';

interface GeolocationState {
  countryCode: string;
  countryName: string;
  isLoading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    countryCode: 'GB', // Default to UK
    countryName: 'United Kingdom',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Try IP-based geolocation first
        const location = await geolocationService.getUserLocation();
        
        if (location) {
          setState({
            countryCode: location.country_code,
            countryName: location.country_name,
            isLoading: false,
            error: null
          });
        } else {
          // Fallback to browser geolocation if IP-based fails
          const browserLocation = await geolocationService.getUserLocationFromBrowser();
          
          if (browserLocation) {
            setState({
              countryCode: browserLocation.country_code,
              countryName: browserLocation.country_name,
              isLoading: false,
              error: null
            });
          } else {
            // Keep default values if all geolocation methods fail
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.warn('Geolocation failed:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to detect location' 
        }));
      }
    };

    detectLocation();
  }, []);

  return state;
}; 