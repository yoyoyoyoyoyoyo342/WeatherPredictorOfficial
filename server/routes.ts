import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWeatherDataSchema, insertLocationSchema } from "@shared/schema";
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHERMAP_API_KEY || "demo_key";
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY || process.env.WEATHER_API_KEY || "demo_key";
const ACCUWEATHER_KEY = process.env.ACCUWEATHER_API_KEY || process.env.ACCUWEATHER_KEY || "demo_key";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search locations
  app.get("/api/locations/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      // Try to fetch from OpenWeatherMap Geocoding API first
      try {
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${OPENWEATHER_API_KEY}`);
        const locations = response.data.map((loc: any) => ({
          name: loc.name,
          latitude: loc.lat,
          longitude: loc.lon,
          country: loc.country,
          state: loc.state
        }));
        
        // Save locations to storage for caching
        for (const location of locations) {
          try {
            await storage.saveLocation(location);
          } catch (error) {
            // Ignore duplicate save errors
          }
        }
        
        return res.json(locations);
      } catch (apiError) {
        console.error("External API error:", apiError);
        // Fallback to local storage
        const localResults = await storage.searchLocations(q);
        return res.json(localResults);
      }
    } catch (error) {
      console.error("Location search error:", error);
      res.status(500).json({ message: "Failed to search locations" });
    }
  });

  // Get weather data with aggregation
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon, location } = req.query;
      
      if ((!lat || !lon) && !location) {
        return res.status(400).json({ message: "Either lat/lon or location is required" });
      }

      const weatherSources = ['openweathermap', 'weatherapi', 'accuweather'];
      const weatherPromises = weatherSources.map(source => fetchWeatherFromSource(source, { lat: Number(lat), lon: Number(lon), location: String(location) }));
      
      const weatherResults = await Promise.allSettled(weatherPromises);
      const successfulResults = weatherResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(Boolean);

      if (successfulResults.length === 0) {
        return res.status(503).json({ message: "Failed to fetch weather data from all sources" });
      }

      // Calculate accuracy scores
      const accuracyPromises = successfulResults.map(async (weather) => {
        const accuracy = await storage.getWeatherAccuracy(weather.source, weather.location);
        return { ...weather, accuracy };
      });

      const weatherWithAccuracy = await Promise.all(accuracyPromises);
      
      // Save to storage
      for (const weather of weatherWithAccuracy) {
        try {
          await storage.saveWeatherData(weather);
        } catch (error) {
          console.error("Failed to save weather data:", error);
        }
      }

      // Determine most accurate source for current conditions
      const mostAccurate = weatherWithAccuracy.reduce((prev, current) => 
        (current.accuracy > prev.accuracy) ? current : prev
      );

      res.json({
        sources: weatherWithAccuracy,
        mostAccurate,
        aggregated: mostAccurate // For now, use most accurate as aggregated result
      });

    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  async function fetchWeatherFromSource(source: string, params: { lat: number; lon: number; location: string }) {
    const { lat, lon } = params;
    
    try {
      switch (source) {
        case 'openweathermap':
          return await fetchOpenWeatherMap(lat, lon);
        case 'weatherapi':
          return await fetchWeatherAPI(lat, lon);
        case 'accuweather':
          return await fetchAccuWeather(lat, lon);
        default:
          throw new Error(`Unknown weather source: ${source}`);
      }
    } catch (error) {
      console.error(`Failed to fetch from ${source}:`, error);
      return null;
    }
  }

  async function fetchOpenWeatherMap(lat: number, lon: number) {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`)
    ]);

    const current = currentRes.data;
    const forecast = forecastRes.data;

    return {
      source: 'openweathermap',
      location: `${current.name}, ${current.sys.country}`,
      latitude: lat,
      longitude: lon,
      currentWeather: {
        temperature: Math.round(current.main.temp),
        condition: current.weather[0].main,
        description: current.weather[0].description,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed),
        windDirection: current.wind.deg,
        visibility: Math.round((current.visibility / 1609.344) * 10) / 10, // Convert to miles
        feelsLike: Math.round(current.main.feels_like),
        uvIndex: 6, // Not available in free tier
        pressure: current.main.pressure
      },
      hourlyForecast: forecast.list.slice(0, 24).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric' }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].main,
        precipitation: Math.round((item.pop || 0) * 100),
        icon: item.weather[0].icon
      })),
      dailyForecast: forecast.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 10)
        .map((item: any, index: number) => ({
          day: index === 0 ? 'Today' : new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          highTemp: Math.round(item.main.temp_max),
          lowTemp: Math.round(item.main.temp_min),
          precipitation: Math.round((item.pop || 0) * 100),
          icon: item.weather[0].icon
        }))
    };
  }

  async function fetchWeatherAPI(lat: number, lon: number) {
    const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=10&aqi=yes`);
    const data = response.data;

    return {
      source: 'weatherapi',
      location: `${data.location.name}, ${data.location.country}`,
      latitude: lat,
      longitude: lon,
      currentWeather: {
        temperature: Math.round(data.current.temp_f),
        condition: data.current.condition.text,
        description: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_mph),
        windDirection: data.current.wind_degree,
        visibility: data.current.vis_miles,
        feelsLike: Math.round(data.current.feelslike_f),
        uvIndex: data.current.uv,
        pressure: data.current.pressure_mb
      },
      hourlyForecast: data.forecast.forecastday[0].hour.slice(0, 24).map((hour: any) => ({
        time: new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric' }),
        temperature: Math.round(hour.temp_f),
        condition: hour.condition.text,
        precipitation: hour.chance_of_rain,
        icon: hour.condition.icon
      })),
      dailyForecast: data.forecast.forecastday.map((day: any, index: number) => ({
        day: index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        condition: day.day.condition.text,
        description: day.day.condition.text,
        highTemp: Math.round(day.day.maxtemp_f),
        lowTemp: Math.round(day.day.mintemp_f),
        precipitation: day.day.daily_chance_of_rain,
        icon: day.day.condition.icon
      }))
    };
  }

  async function fetchAccuWeather(lat: number, lon: number) {
    // AccuWeather requires location key first
    const locationRes = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${ACCUWEATHER_KEY}&q=${lat},${lon}`);
    const locationKey = locationRes.data.Key;

    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_KEY}&details=true`),
      axios.get(`http://dataservice.accuweather.com/forecasts/v1/daily/10day/${locationKey}?apikey=${ACCUWEATHER_KEY}&details=true&metric=false`)
    ]);

    const current = currentRes.data[0];
    const forecast = forecastRes.data;

    return {
      source: 'accuweather',
      location: `${locationRes.data.LocalizedName}, ${locationRes.data.Country.LocalizedName}`,
      latitude: lat,
      longitude: lon,
      currentWeather: {
        temperature: Math.round(current.Temperature.Imperial.Value),
        condition: current.WeatherText,
        description: current.WeatherText,
        humidity: current.RelativeHumidity,
        windSpeed: Math.round(current.Wind.Speed.Imperial.Value),
        windDirection: current.Wind.Direction.Degrees,
        visibility: Math.round(current.Visibility.Imperial.Value),
        feelsLike: Math.round(current.RealFeelTemperature.Imperial.Value),
        uvIndex: current.UVIndex,
        pressure: current.Pressure.Imperial.Value
      },
      hourlyForecast: [], // AccuWeather hourly requires separate API call
      dailyForecast: forecast.DailyForecasts.map((day: any, index: number) => ({
        day: index === 0 ? 'Today' : new Date(day.Date).toLocaleDateString('en-US', { weekday: 'short' }),
        condition: day.Day.IconPhrase,
        description: day.Day.LongPhrase,
        highTemp: Math.round(day.Temperature.Maximum.Value),
        lowTemp: Math.round(day.Temperature.Minimum.Value),
        precipitation: day.Day.PrecipitationProbability,
        icon: day.Day.Icon
      }))
    };
  }

  const httpServer = createServer(app);
  return httpServer;
}
