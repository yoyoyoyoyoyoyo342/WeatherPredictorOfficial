import { apiRequest } from "./queryClient";
import { WeatherResponse, Location } from "../types/weather";

export const weatherApi = {
  searchLocations: async (query: string): Promise<Location[]> => {
    const response = await apiRequest("GET", `/api/locations/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  getWeatherData: async (lat: number, lon: number): Promise<WeatherResponse> => {
    const response = await apiRequest("GET", `/api/weather?lat=${lat}&lon=${lon}`);
    return response.json();
  },

  getCurrentLocation: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      });
    });
  },
};
