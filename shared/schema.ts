import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  source: text("source").notNull(), // 'openweathermap', 'weatherapi', 'accuweather'
  currentWeather: jsonb("current_weather"),
  hourlyForecast: jsonb("hourly_forecast"),
  dailyForecast: jsonb("daily_forecast"),
  accuracy: real("accuracy"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  country: text("country"),
  state: text("state"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  fetchedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
