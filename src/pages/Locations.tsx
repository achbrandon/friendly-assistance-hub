import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

interface Location {
  id: number;
  name: string;
  type: "branch" | "atm";
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  hours?: string;
  lat: number;
  lng: number;
}

const Locations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "branch" | "atm">("all");

  // VaultBank global branch locations
  const locations: Location[] = [
    // United States Branches
    {
      id: 1,
      name: "VaultBank Brodhead Branch",
      type: "branch",
      address: "806 E Exchange St",
      city: "Brodhead",
      state: "WI",
      zip: "53520-0108",
      phone: "(608) 555-0100",
      hours: "Mon-Fri 9AM-5PM, Sat 10AM-2PM",
      lat: 42.6194,
      lng: -89.3751
    },
    {
      id: 2,
      name: "VaultBank New York Branch",
      type: "branch",
      address: "450 Park Avenue",
      city: "New York",
      state: "NY",
      zip: "10022",
      phone: "(212) 555-0200",
      hours: "Mon-Fri 9AM-6PM, Sat 10AM-3PM",
      lat: 40.7614,
      lng: -73.9776
    },
    {
      id: 3,
      name: "VaultBank Los Angeles Branch",
      type: "branch",
      address: "1801 Century Park East",
      city: "Los Angeles",
      state: "CA",
      zip: "90067",
      phone: "(310) 555-0300",
      hours: "Mon-Fri 9AM-5PM, Sat 10AM-2PM",
      lat: 34.0553,
      lng: -118.4137
    },
    {
      id: 4,
      name: "VaultBank Miami Branch",
      type: "branch",
      address: "100 SE 2nd Street",
      city: "Miami",
      state: "FL",
      zip: "33131",
      phone: "(305) 555-0400",
      hours: "Mon-Fri 9AM-5PM, Sat 10AM-2PM",
      lat: 25.7743,
      lng: -80.1937
    },
    // Turkey Branches
    {
      id: 5,
      name: "VaultBank Istanbul Levent Branch",
      type: "branch",
      address: "Büyükdere Caddesi No:127",
      city: "Istanbul",
      state: "Levent",
      zip: "34394",
      phone: "+90 212 555-0500",
      hours: "Mon-Fri 9AM-6PM",
      lat: 41.0799,
      lng: 29.0121
    },
    {
      id: 6,
      name: "VaultBank Istanbul Kadıköy Branch",
      type: "branch",
      address: "Moda Caddesi No:45",
      city: "Istanbul",
      state: "Kadıköy",
      zip: "34710",
      phone: "+90 216 555-0600",
      hours: "Mon-Fri 9AM-6PM, Sat 10AM-2PM",
      lat: 40.9877,
      lng: 29.0292
    },
    {
      id: 7,
      name: "VaultBank Ankara Kızılay Branch",
      type: "branch",
      address: "Atatürk Bulvarı No:89",
      city: "Ankara",
      state: "Çankaya",
      zip: "06420",
      phone: "+90 312 555-0700",
      hours: "Mon-Fri 9AM-6PM",
      lat: 39.9208,
      lng: 32.8541
    },
    {
      id: 8,
      name: "VaultBank Izmir Alsancak Branch",
      type: "branch",
      address: "Cumhuriyet Bulvarı No:156",
      city: "Izmir",
      state: "Konak",
      zip: "35220",
      phone: "+90 232 555-0800",
      hours: "Mon-Fri 9AM-6PM, Sat 10AM-2PM",
      lat: 38.4363,
      lng: 27.1428
    },
    {
      id: 9,
      name: "VaultBank Antalya Branch",
      type: "branch",
      address: "Atatürk Caddesi No:67",
      city: "Antalya",
      state: "Muratpaşa",
      zip: "07100",
      phone: "+90 242 555-0900",
      hours: "Mon-Fri 9AM-6PM",
      lat: 36.8969,
      lng: 30.7133
    },
    // United Kingdom Branches
    {
      id: 10,
      name: "VaultBank London Canary Wharf Branch",
      type: "branch",
      address: "25 Canada Square",
      city: "London",
      state: "Greater London",
      zip: "E14 5LQ",
      phone: "+44 20 5555-1000",
      hours: "Mon-Fri 9AM-6PM",
      lat: 51.5054,
      lng: -0.0235
    },
    {
      id: 11,
      name: "VaultBank Manchester Branch",
      type: "branch",
      address: "100 Deansgate",
      city: "Manchester",
      state: "Greater Manchester",
      zip: "M3 2RW",
      phone: "+44 161 555-1100",
      hours: "Mon-Fri 9AM-5PM, Sat 10AM-2PM",
      lat: 53.4794,
      lng: -2.2453
    },
    // Germany Branches
    {
      id: 12,
      name: "VaultBank Frankfurt Branch",
      type: "branch",
      address: "Taunusanlage 12",
      city: "Frankfurt",
      state: "Hessen",
      zip: "60325",
      phone: "+49 69 555-1200",
      hours: "Mon-Fri 9AM-6PM",
      lat: 50.1109,
      lng: 8.6821
    },
    {
      id: 13,
      name: "VaultBank Berlin Branch",
      type: "branch",
      address: "Unter den Linden 21",
      city: "Berlin",
      state: "Berlin",
      zip: "10117",
      phone: "+49 30 555-1300",
      hours: "Mon-Fri 9AM-6PM",
      lat: 52.5170,
      lng: 13.3889
    },
    // France Branches
    {
      id: 14,
      name: "VaultBank Paris Branch",
      type: "branch",
      address: "45 Avenue des Champs-Élysées",
      city: "Paris",
      state: "Île-de-France",
      zip: "75008",
      phone: "+33 1 5555-1400",
      hours: "Mon-Fri 9AM-6PM",
      lat: 48.8698,
      lng: 2.3078
    },
    // ATM Locations
    {
      id: 15,
      name: "VaultBank ATM - Istanbul Airport",
      type: "atm",
      address: "Istanbul Airport Terminal",
      city: "Istanbul",
      state: "Arnavutköy",
      zip: "34283",
      phone: "",
      hours: "24/7",
      lat: 41.2753,
      lng: 28.7519
    },
    {
      id: 16,
      name: "VaultBank ATM - Times Square",
      type: "atm",
      address: "Broadway & 42nd Street",
      city: "New York",
      state: "NY",
      zip: "10036",
      phone: "",
      hours: "24/7",
      lat: 40.7580,
      lng: -73.9855
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
          <h1 className="text-4xl font-bold mb-4">Find VaultBank Locations</h1>
          <p className="text-xl opacity-90 mb-8">
            Locate branches and ATMs near you
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
                All Locations
              </Button>
              <Button
                variant={filterType === "branch" ? "secondary" : "outline"}
                onClick={() => setFilterType("branch")}
              >
                Branches
              </Button>
              <Button
                variant={filterType === "atm" ? "secondary" : "outline"}
                onClick={() => setFilterType("atm")}
              >
                ATMs
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
                  
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${location.phone}`} className="hover:underline">
                        {location.phone}
                      </a>
                    </div>
                  )}
                  
                  {location.hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{location.hours}</span>
                    </div>
                  )}
                  
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
