# Weather Aggregator Application

## Overview

This is a modern weather application built with React, Express, and PostgreSQL that aggregates weather data from multiple sources (OpenWeatherMap, AccuWeather, and WeatherAPI) to provide users with the most accurate weather information. The application compares data across sources, calculates accuracy scores, and presents a comprehensive weather dashboard with current conditions, hourly forecasts, and 10-day predictions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in client-side rendering mode
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom weather-themed color palette
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints for weather data and location search
- **Data Layer**: Drizzle ORM for type-safe database operations
- **Storage Strategy**: Dual storage approach with in-memory fallback and PostgreSQL persistence
- **Error Handling**: Centralized error middleware with structured error responses

### Database Schema
- **Weather Data Table**: Stores aggregated weather information with JSON fields for current, hourly, and daily forecasts
- **Locations Table**: Caches searchable location data with coordinates and metadata
- **Database Provider**: PostgreSQL (configured) with Neon Database serverless option

### External API Integration
- **Multi-Source Weather Data**: Integrates three weather APIs (OpenWeatherMap, AccuWeather, WeatherAPI) with fallback mechanisms
- **Location Services**: OpenWeatherMap Geocoding API for location search with local caching
- **Accuracy Calculation**: Proprietary algorithm to determine most reliable weather source per location

### Authentication & Security
- **Session Management**: Express sessions with PostgreSQL session store
- **Environment Variables**: Secure API key management for external services
- **CORS Configuration**: Development-friendly CORS setup with credential support

### Development & Deployment
- **Hot Module Replacement**: Vite dev server integration with Express in development
- **TypeScript Configuration**: Shared types between client and server via `shared/` directory
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines
- **Static File Serving**: Express serves built client assets in production

## External Dependencies

### Weather APIs
- **OpenWeatherMap API**: Primary weather data source with geocoding services
- **AccuWeather API**: Secondary weather data source for accuracy comparison
- **WeatherAPI**: Tertiary weather data source for comprehensive coverage

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **PostgreSQL**: Primary database engine with JSON support for complex weather data

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment mapping
- **Runtime Error Overlay**: Development error handling and debugging support

### UI & Styling
- **Google Fonts**: Inter font family for modern typography
- **Lucide React**: Comprehensive icon library for weather and UI icons
- **Radix UI**: Headless component primitives for accessibility and functionality

### Build & Development
- **Vite**: Frontend build tool with React plugin and TypeScript support
- **esbuild**: Server-side bundling for optimized Node.js deployment
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer