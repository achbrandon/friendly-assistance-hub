import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";

interface Location {
  id: number;
  name: string;
  type: "branch" | "atm";
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

const Locations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "branch" | "atm">("all");

  // VaultBank international branch locations in major cities
  const locations: Location[] = [
    // United States Branches
    {
      id: 1,
      name: "VaultBank New York Financial District",
      type: "branch",
      address: "450 Park Avenue",
      city: "New York",
      state: "NY",
      zip: "10022",
      lat: 40.7614,
      lng: -73.9776
    },
    {
      id: 2,
      name: "VaultBank Los Angeles",
      type: "branch",
      address: "1801 Century Park East",
      city: "Los Angeles",
      state: "CA",
      zip: "90067",
      lat: 34.0553,
      lng: -118.4137
    },
    {
      id: 3,
      name: "VaultBank Chicago Loop",
      type: "branch",
      address: "233 South Wacker Drive",
      city: "Chicago",
      state: "IL",
      zip: "60606",
      lat: 41.8781,
      lng: -87.6298
    },
    // Turkey Branches
    {
      id: 5,
      name: "VaultBank Istanbul Levent Financial Center",
      type: "branch",
      address: "Büyükdere Caddesi No:127",
      city: "Istanbul",
      state: "Levent",
      zip: "34394",
      lat: 41.0799,
      lng: 29.0121
    },
    {
      id: 7,
      name: "VaultBank Ankara Central",
      type: "branch",
      address: "Atatürk Bulvarı No:89",
      city: "Ankara",
      state: "Çankaya",
      zip: "06420",
      lat: 39.9208,
      lng: 32.8541
    },
    {
      id: 8,
      name: "VaultBank Izmir Alsancak",
      type: "branch",
      address: "Cumhuriyet Bulvarı No:156",
      city: "Izmir",
      state: "Konak",
      zip: "35220",
      lat: 38.4363,
      lng: 27.1428
    },
    // Germany Branches
    {
      id: 13,
      name: "VaultBank Frankfurt Financial Hub",
      type: "branch",
      address: "Taunusanlage 12",
      city: "Frankfurt",
      state: "Hessen",
      zip: "60325",
      lat: 50.1109,
      lng: 8.6821
    },
    {
      id: 14,
      name: "VaultBank Berlin",
      type: "branch",
      address: "Unter den Linden 21",
      city: "Berlin",
      state: "Berlin",
      zip: "10117",
      lat: 52.5170,
      lng: 13.3889
    },
    {
      id: 15,
      name: "VaultBank Munich",
      type: "branch",
      address: "Maximilianstraße 13",
      city: "Munich",
      state: "Bavaria",
      zip: "80539",
      lat: 48.1375,
      lng: 11.5755
    },
    // France Branches
    {
      id: 16,
      name: "VaultBank Paris Champs-Élysées",
      type: "branch",
      address: "45 Avenue des Champs-Élysées",
      city: "Paris",
      state: "Île-de-France",
      zip: "75008",
      lat: 48.8698,
      lng: 2.3078
    },
    // Spain Branches
    {
      id: 18,
      name: "VaultBank Barcelona",
      type: "branch",
      address: "Passeig de Gràcia 77",
      city: "Barcelona",
      state: "Catalonia",
      zip: "08008",
      lat: 41.3874,
      lng: 2.1686
    },
    // Italy Branches
    {
      id: 19,
      name: "VaultBank Milan",
      type: "branch",
      address: "Via Montenapoleone 8",
      city: "Milan",
      state: "Lombardy",
      zip: "20121",
      lat: 45.4654,
      lng: 9.1859
    },
    // Singapore Branch
    {
      id: 22,
      name: "VaultBank Singapore",
      type: "branch",
      address: "1 Raffles Place",
      city: "Singapore",
      state: "Singapore",
      zip: "048616",
      lat: 1.2844,
      lng: 103.8511
    }
  ];

  const filteredLocations = locations.filter(location => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.zip.includes(searchQuery);
    
    const matchesFilter = filterType === "all" || location.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">VaultBank Global Branches</h1>
          <p className="text-xl opacity-90 mb-8">
            Visit our branches in major cities worldwide. As an international online bank, we serve customers globally with physical locations in key financial centers.
          </p>
          
          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <Input
              type="text"
              placeholder="Search by city, state, or ZIP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md bg-primary-foreground text-foreground"
            />
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "secondary" : "outline"}
                onClick={() => setFilterType("all")}
              >
                All Branches
              </Button>
              <Button
                variant={filterType === "branch" ? "secondary" : "outline"}
                onClick={() => setFilterType("branch")}
              >
                Major Cities
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Location List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''} Found
            </h2>
            
            {filteredLocations.map((location) => (
              <Card key={location.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {location.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {location.type === "branch" ? "Branch" : "ATM"}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{location.address}</p>
                      <p>{location.city}, {location.state} {location.zip}</p>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
