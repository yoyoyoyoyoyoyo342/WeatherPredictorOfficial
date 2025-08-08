import { MapPin, RefreshCw, Eye, Droplets, Wind, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeatherSource } from "@/types/weather";

interface CurrentWeatherProps {
  weatherData: WeatherSource[];
  mostAccurate: WeatherSource;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function CurrentWeather({ 
  weatherData, 
  mostAccurate, 
  onRefresh, 
  isLoading,
  lastUpdated 
}: CurrentWeatherProps) {
  const sourceColors = {
    openweathermap: "bg-secondary",
    accuweather: "bg-accent",
    weatherapi: "bg-primary",
    demo: "bg-neutral-400"
  };

  const sourceNames = {
    openweathermap: "OpenWeatherMap",
    accuweather: "AccuWeather",
    weatherapi: "WeatherAPI",
    demo: "Demo Data"
  };

  const getSourceAbbreviation = (source: string) => {
    const abbrev = {
      openweathermap: "OWM",
      accuweather: "ACC",
      weatherapi: "API"
    };
    return abbrev[source as keyof typeof abbrev] || source.toUpperCase();
  };

  return (
    <section className="mb-8">
      <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5" />
              <span className="text-lg font-semibold text-neutral-800">
                {mostAccurate.location}
              </span>
            </div>
            <div className="text-sm text-neutral-500">
              <span>
                Updated {lastUpdated ? 
                  new Date(Date.now() - lastUpdated.getTime()).getMinutes() + ' min ago' : 
                  'just now'
                }
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Temperature & Conditions */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                  <span className="text-2xl">☀️</span>
                </div>
                <div>
                  <div className="text-6xl font-bold text-neutral-800">
                    {mostAccurate.currentWeather.temperature}°
                  </div>
                  <div className="text-neutral-600 text-lg">
                    {mostAccurate.currentWeather.condition}
                  </div>
                </div>
              </div>

              {/* Weather Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="text-primary w-4 h-4" />
                    <span className="text-sm text-neutral-600">Visibility</span>
                  </div>
                  <div className="text-xl font-semibold text-neutral-800">
                    {mostAccurate.currentWeather.visibility} mi
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="text-primary w-4 h-4" />
                    <span className="text-sm text-neutral-600">Humidity</span>
                  </div>
                  <div className="text-xl font-semibold text-neutral-800">
                    {mostAccurate.currentWeather.humidity}%
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="text-primary w-4 h-4" />
                    <span className="text-sm text-neutral-600">Wind</span>
                  </div>
                  <div className="text-xl font-semibold text-neutral-800">
                    {mostAccurate.currentWeather.windSpeed} mph
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="text-primary w-4 h-4" />
                    <span className="text-sm text-neutral-600">Feels like</span>
                  </div>
                  <div className="text-xl font-semibold text-neutral-800">
                    {mostAccurate.currentWeather.feelsLike}°
                  </div>
                </div>
              </div>
            </div>

            {/* Accuracy Dashboard */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Source Accuracy
              </h3>

              <div className="space-y-4">
                {weatherData.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${sourceColors[source.source as keyof typeof sourceColors]}`}></div>
                      <span className="font-medium text-neutral-700">
                        {sourceNames[source.source as keyof typeof sourceNames]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${sourceColors[source.source as keyof typeof sourceColors]}`}
                          style={{ width: `${source.accuracy * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-neutral-800">
                        {Math.round(source.accuracy * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-white/60 rounded-lg">
                <p className="text-sm text-neutral-600">
                  <span className="text-accent">💡</span>
                  <span className="font-medium ml-1">Most Accurate:</span> {sourceNames[mostAccurate.source as keyof typeof sourceNames]} for current conditions
                </p>
              </div>

              <Button
                onClick={onRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full mt-4"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
