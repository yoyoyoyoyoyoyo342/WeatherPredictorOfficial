import { type WeatherData, type InsertWeatherData, type Location, type InsertLocation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Weather data methods
  getWeatherData(location: string, source?: string): Promise<WeatherData[]>;
  saveWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  getLocationByCoords(lat: number, lon: number): Promise<Location | undefined>;
  saveLocation(location: InsertLocation): Promise<Location>;
  searchLocations(query: string): Promise<Location[]>;
  getWeatherAccuracy(source: string, location: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, any>;
  private weatherData: Map<string, WeatherData>;
  private locations: Map<string, Location>;

  constructor() {
    this.users = new Map();
    this.weatherData = new Map();
    this.locations = new Map();
  }

  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWeatherData(location: string, source?: string): Promise<WeatherData[]> {
    const data = Array.from(this.weatherData.values()).filter(
      (weather) => weather.location === location && (!source || weather.source === source)
    );
    return data.sort((a, b) => new Date(b.fetchedAt || 0).getTime() - new Date(a.fetchedAt || 0).getTime());
  }

  async saveWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    const id = randomUUID();
    const weatherData: WeatherData = { 
      ...data, 
      id, 
      fetchedAt: new Date() 
    };
    this.weatherData.set(id, weatherData);
    return weatherData;
  }

  async getLocationByCoords(lat: number, lon: number): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(
      (loc) => Math.abs(loc.latitude - lat) < 0.01 && Math.abs(loc.longitude - lon) < 0.01
    );
  }

  async saveLocation(location: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const loc: Location = { 
      ...location, 
      id, 
      createdAt: new Date() 
    };
    this.locations.set(id, loc);
    return loc;
  }

  async searchLocations(query: string): Promise<Location[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.locations.values()).filter(
      (loc) => loc.name.toLowerCase().includes(lowercaseQuery) ||
               loc.country?.toLowerCase().includes(lowercaseQuery) ||
               loc.state?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getWeatherAccuracy(source: string, location: string): Promise<number> {
    // Mock accuracy calculation - in real implementation, this would be based on historical data
    const accuracyMap: Record<string, number> = {
      openweathermap: 0.94,
      accuweather: 0.89,
      weatherapi: 0.87
    };
    return accuracyMap[source] || 0.85;
  }
}

export const storage = new MemStorage();
