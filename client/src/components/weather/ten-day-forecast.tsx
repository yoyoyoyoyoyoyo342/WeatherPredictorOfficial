import { CalendarDays, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DailyForecast, WeatherSource } from "@/types/weather";

interface TenDayForecastProps {
  dailyForecast: DailyForecast[];
  weatherSources: WeatherSource[];
}

export function TenDayForecast({ dailyForecast, weatherSources }: TenDayForecastProps) {
  const sourceColors = {
    openweathermap: "bg-secondary",
    accuweather: "bg-accent", 
    weatherapi: "bg-primary"
  };

  const getSourceAbbreviation = (source: string) => {
    const abbrev = {
      openweathermap: "OWM",
      accuweather: "ACC",
      weatherapi: "API"
    };
    return abbrev[source as keyof typeof abbrev] || source.toUpperCase();
  };

  // Get the most accurate source for each day (simplified - just use most accurate overall)
  const mostAccurateSource = weatherSources.reduce((prev, current) => 
    (current.accuracy > prev.accuracy) ? current : prev
  );

  return (
    <section className="mb-8">
      <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
            <CalendarDays className="text-primary w-5 h-5" />
            10-Day Forecast
          </h2>

          <div className="space-y-3">
            {dailyForecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 text-neutral-600 font-medium">
                    {day.day}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                    <span className="text-lg">☀️</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-neutral-800">
                      {day.condition}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {day.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Droplets className="text-blue-500 w-3 h-3" />
                    <span className="text-sm text-neutral-600">
                      {day.precipitation}%
                    </span>
                  </div>

                  {/* Accuracy indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sourceColors[mostAccurateSource.source as keyof typeof sourceColors]}`}></div>
                    <span className="text-xs text-neutral-500">
                      {getSourceAbbreviation(mostAccurateSource.source)}
                    </span>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="font-semibold text-neutral-800">
                      {day.highTemp}°
                    </div>
                    <div className="text-sm text-neutral-500">
                      {day.lowTemp}°
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500">
              {weatherSources.map((source) => (
                <div key={source.source} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sourceColors[source.source as keyof typeof sourceColors]}`}></div>
                  <span>
                    {source.source === 'openweathermap' ? 'OpenWeatherMap' :
                     source.source === 'accuweather' ? 'AccuWeather' :
                     source.source === 'weatherapi' ? 'WeatherAPI' :
                     source.source}
                  </span>
                </div>
              ))}
              <span className="ml-4">• Most accurate source shown for each day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
