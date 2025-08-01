interface GeolocationResponse {
  country_code: string;
  country_name: string;
  city?: string;
  region?: string;
}

export class GeolocationService {
  private static instance: GeolocationService;
  private cachedLocation: GeolocationResponse | null = null;

  private constructor() {}

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  async getUserLocation(): Promise<GeolocationResponse | null> {
    // Return cached location if available
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      // Try multiple geolocation services for better reliability
      const location = await this.tryMultipleServices();
      if (location) {
        this.cachedLocation = location;
        return location;
      }
    } catch (error) {
      console.warn('Failed to detect user location:', error);
    }

    return null;
  }

  private async tryMultipleServices(): Promise<GeolocationResponse | null> {
    const services = [
      this.tryIpApi,
      this.tryIpInfo,
      this.tryIpApiCo
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn('Geolocation service failed:', error);
        // Continue to next service without blocking
        continue;
      }
    }

    // If all services fail, return null but don't throw
    return null;
  }

  private async tryIpApi(): Promise<GeolocationResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const response = await fetch('https://ip-api.com/json/?fields=countryCode,country,city,region', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('IP-API request failed');
      
      const data = await response.json();
      return {
        country_code: data.countryCode,
        country_name: data.country,
        city: data.city,
        region: data.region
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async tryIpInfo(): Promise<GeolocationResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const response = await fetch('https://ipinfo.io/json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('IPInfo request failed');
      
      const data = await response.json();
      return {
        country_code: data.country,
        country_name: data.country,
        city: data.city,
        region: data.region
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async tryIpApiCo(): Promise<GeolocationResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('IPAPI.co request failed');
      
      const data = await response.json();
      return {
        country_code: data.country_code,
        country_name: data.country_name,
        city: data.city,
        region: data.region
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Fallback method using browser geolocation (requires user permission)
  async getUserLocationFromBrowser(): Promise<GeolocationResponse | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              resolve({
                country_code: data.countryCode,
                country_name: data.countryName,
                city: data.city,
                region: data.principalSubdivision
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.warn('Browser geolocation failed:', error);
            resolve(null);
          }
        },
        (error) => {
          console.warn('Geolocation permission denied or failed:', error);
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }
}

export const geolocationService = GeolocationService.getInstance(); 