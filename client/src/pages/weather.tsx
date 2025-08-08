import { useState, useEffect } from "react";
import { CloudSun, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { weatherApi } from "@/lib/weather-api";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { LocationSearch } from "@/components/weather/location-search";
import { CurrentWeather } from "@/components/weather/current-weather";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { TenDayForecast } from "@/components/weather/ten-day-forecast";
import { DetailedMetrics } from "@/components/weather/detailed-metrics";
import { WeatherResponse } from "@/types/weather";

export default function WeatherPage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  const [isImperial, setIsImperial] = useState(true); // true for Fahrenheit, false for Celsius
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const {
    data: weatherData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["/api/weather", selectedLocation?.lat, selectedLocation?.lon],
    enabled: !!selectedLocation,
    queryFn: () =>
      weatherApi.getWeatherData(selectedLocation!.lat, selectedLocation!.lon),
    onSuccess: () => {
      setLastUpdated(new Date());
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to fetch weather data",
        description: error.message || "Please check your connection and try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-detect location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const position = await weatherApi.getCurrentLocation();
        const { latitude, longitude } = position.coords;
        setSelectedLocation({
          lat: latitude,
          lon: longitude,
          name: "Current Location",
        });
      } catch (error) {
        console.log("Location detection failed, user will need to search manually");
      }
    };

    detectLocation();
  }, []);

  const handleLocationSelect = (lat: number, lon: number, locationName: string) => {
    setSelectedLocation({ lat, lon, name: locationName });
  };

  const handleRefresh = () => {
    refetch();
  };

  const convertTemperature = (temp: number) => {
    return isImperial ? temp : Math.round((temp - 32) * 5/9);
  };

  return (
    <div className="font-inter bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white p-3 rounded-xl">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">WeatherSync</h1>
                <p className="text-neutral-600 text-sm">Multi-source weather accuracy</p>
              </div>
            </div>

            <LocationSearch onLocationSelect={handleLocationSelect} />

            {/* Settings Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 text-neutral-600">
                <span className="text-sm font-medium">°F</span>
                <Switch
                  checked={!isImperial}
                  onCheckedChange={(checked) => setIsImperial(!checked)}
                />
                <span className="text-sm font-medium">°C</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-600 hover:text-primary hover:bg-white rounded-xl"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Loading Overlay */}
        <LoadingOverlay isOpen={isLoading && !weatherData} />

        {/* Main Content */}
        {!selectedLocation ? (
          <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100 text-center py-12">
            <CardContent>
              <CloudSun className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                Welcome to WeatherSync
              </h2>
              <p className="text-neutral-600">
                Search for a location above or allow location access to get started
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-red-50 border-red-200 rounded-2xl shadow-lg text-center py-12">
            <CardContent>
              <div className="text-red-600 mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Failed to load weather data
              </h2>
              <p className="text-red-600 mb-4">
                Please check your connection and try again
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : weatherData ? (
          <>
            <CurrentWeather
              weatherData={weatherData.sources}
              mostAccurate={weatherData.mostAccurate}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              lastUpdated={lastUpdated}
            />

            <HourlyForecast 
              hourlyData={weatherData.mostAccurate.hourlyForecast} 
            />

            <TenDayForecast
              dailyForecast={weatherData.mostAccurate.dailyForecast}
              weatherSources={weatherData.sources}
            />

            <DetailedMetrics 
              currentWeather={weatherData.mostAccurate.currentWeather}
            />

            {/* Footer */}
            <footer className="text-center py-8 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-neutral-600 text-sm">
                  Data from{" "}
                  <span className="font-medium">OpenWeatherMap</span>,{" "}
                  <span className="font-medium">AccuWeather</span>, and{" "}
                  <span className="font-medium">WeatherAPI</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>
                    Last updated:{" "}
                    <span>
                      {lastUpdated
                        ? `${Math.floor(
                            (Date.now() - lastUpdated.getTime()) / (1000 * 60)
                          )} minutes ago`
                        : "just now"}
                    </span>
                  </span>
                  <Button
                    onClick={handleRefresh}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 transition-colors p-0"
                  >
                    🔄 Refresh
                  </Button>
                </div>
              </div>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
