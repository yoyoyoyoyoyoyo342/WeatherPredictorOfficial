import { useState, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@/lib/weather-api";
import { Location } from "@/types/weather";
import { useToast } from "@/hooks/use-toast";

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, locationName: string) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["/api/locations/search", debouncedQuery],
    enabled: debouncedQuery.length > 2,
    queryFn: () => weatherApi.searchLocations(debouncedQuery),
  });

  const handleLocationDetection = async () => {
    setIsDetecting(true);
    try {
      const position = await weatherApi.getCurrentLocation();
      const { latitude, longitude } = position.coords;
      onLocationSelect(latitude, longitude, "Current Location");
      toast({
        title: "Location detected",
        description: "Using your current location for weather data.",
      });
    } catch (error) {
      toast({
        title: "Location detection failed",
        description: "Please search for a location manually.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-16 py-3 bg-white rounded-xl border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <Button
          onClick={handleLocationDetection}
          disabled={isDetecting}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary transition-colors p-2"
        >
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {(searchQuery.length > 2 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border border-neutral-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-neutral-600">
                <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                Searching...
              </div>
            ) : locations.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {locations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onLocationSelect(
                        location.latitude,
                        location.longitude,
                        `${location.name}, ${location.state ? `${location.state}, ` : ''}${location.country}`
                      );
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                  >
                    <div className="font-medium text-neutral-800">{location.name}</div>
                    <div className="text-sm text-neutral-500">
                      {location.state ? `${location.state}, ` : ''}{location.country}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="p-4 text-center text-neutral-600">
                No locations found
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
