import { Sun, Leaf, Sunrise, Sunset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CurrentWeather } from "@/types/weather";

interface DetailedMetricsProps {
  currentWeather: CurrentWeather;
}

export function DetailedMetrics({ currentWeather }: DetailedMetricsProps) {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* UV Index Card */}
        <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sun className="text-yellow-600 w-5 h-5" />
              </div>
              <h3 className="font-semibold text-neutral-800">UV Index</h3>
            </div>
            <div className="text-3xl font-bold text-neutral-800 mb-2">
              {currentWeather.uvIndex}
            </div>
            <div className="text-sm text-neutral-600 mb-4">
              {currentWeather.uvIndex <= 2 ? 'Low - No protection needed' :
               currentWeather.uvIndex <= 5 ? 'Moderate - Some protection needed' :
               currentWeather.uvIndex <= 7 ? 'High - Wear sunscreen' :
               currentWeather.uvIndex <= 10 ? 'Very High - Extra protection needed' :
               'Extreme - Avoid sun exposure'}
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full" 
                style={{ width: `${Math.min((currentWeather.uvIndex / 11) * 100, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Air Quality Card */}
        <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="text-green-600 w-5 h-5" />
              </div>
              <h3 className="font-semibold text-neutral-800">Air Quality</h3>
            </div>
            <div className="text-3xl font-bold text-neutral-800 mb-2">42</div>
            <div className="text-sm text-neutral-600 mb-4">Good - Clean air</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-neutral-600">EPA Standard</span>
            </div>
          </CardContent>
        </Card>

        {/* Sunrise/Sunset Card */}
        <Card className="bg-white rounded-2xl shadow-lg border border-neutral-100 md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sunrise className="text-orange-600 w-5 h-5" />
              </div>
              <h3 className="font-semibold text-neutral-800">Sun Times</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sunrise className="text-orange-500 w-4 h-4" />
                  <span className="text-neutral-600">Sunrise</span>
                </div>
                <span className="font-semibold text-neutral-800">6:42 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sunset className="text-orange-500 w-4 h-4" />
                  <span className="text-neutral-600">Sunset</span>
                </div>
                <span className="font-semibold text-neutral-800">7:28 PM</span>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Daylight</span>
                  <span className="text-neutral-700 font-medium">12h 46m</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
