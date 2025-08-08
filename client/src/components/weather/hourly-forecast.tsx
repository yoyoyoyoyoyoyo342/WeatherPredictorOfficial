import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HourlyForecast as HourlyData } from "@/types/weather";

interface HourlyForecastProps {
  hourlyData: HourlyData[];
}

export function HourlyForecast({ hourlyData }: HourlyForecastProps) {
  return (
    <section className="mb-8">
      <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
            <Clock className="text-primary w-5 h-5" />
            24-Hour Forecast
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
            {hourlyData.map((hour, index) => (
              <div
                key={index}
                className="flex-shrink-0 text-center p-4 rounded-xl hover:bg-neutral-50 transition-colors min-w-[80px]"
              >
                <div className="text-sm text-neutral-600 mb-2">{hour.time}</div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                  <span className="text-sm">☀️</span>
                </div>
                <div className="text-lg font-semibold text-neutral-800">
                  {hour.temperature}°
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {hour.precipitation}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
