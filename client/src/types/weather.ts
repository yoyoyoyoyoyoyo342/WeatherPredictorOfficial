export interface WeatherSource {
  source: string;
  location: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  currentWeather: CurrentWeather;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
}

export interface CurrentWeather {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  feelsLike: number;
  uvIndex: number;
  pressure: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  precipitation: number;
  icon?: string;
}

export interface DailyForecast {
  day: string;
  condition: string;
  description: string;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
  icon?: string;
}

export interface WeatherResponse {
  sources: WeatherSource[];
  mostAccurate: WeatherSource;
  aggregated: WeatherSource;
}

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}
