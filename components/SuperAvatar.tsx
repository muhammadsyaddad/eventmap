'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Search, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useLocations } from "@/app/hooks/useLocations"
import { toast } from "sonner"
import { useLocationContext } from "@/app/contexts/LocationContext"
import { getLocationColor, toTitleCase } from '@/app/utils/colorUtils';
import { useAuth } from "@/app/contexts/AuthContext"
import { useRouter } from 'next/navigation'

// Add this interface at the top level
interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export function PopoverDemo() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { addLocation, locations } = useLocations();
  const { setSelectedLocation } = useLocationContext();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Remove pulse effect from all markers first
    document.querySelectorAll('.marker').forEach(m => {
      m.classList.remove('marker-pulse');
    });

    if (term.trim() === '') return;

    // Find matching locations and highlight their markers
    const matchingMarkers = document.querySelectorAll('.marker');
    locations.forEach((location, index) => {
      if (location.name.toLowerCase().includes(term.toLowerCase())) {
        const marker = matchingMarkers[index];
        if (marker) {
          marker.classList.add('marker-pulse');
          // If it's the first match, center the map on it
          if (index === locations.findIndex(l => 
            l.name.toLowerCase().includes(term.toLowerCase())
          )) {
            setSelectedLocation([location.longitude, location.latitude]);
          }
        }
      }
    });
  };

  const handleCoordinateChange = (type: 'latitude' | 'longitude', value: string) => {
    // Allow only numbers, dots, and minus signs
    const sanitizedValue = value.replace(/[^\d.-]/g, '');
    setNewLocation(prev => ({ ...prev, [type]: sanitizedValue }));

    // If both coordinates are valid, update map center
    const lat = type === 'latitude' ? sanitizedValue : newLocation.latitude;
    const lng = type === 'longitude' ? sanitizedValue : newLocation.longitude;
    
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum) && 
          latNum >= -90 && latNum <= 90 && 
          lngNum >= -180 && lngNum <= 180) {
        setSelectedLocation([lngNum, latNum]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lat = parseFloat(newLocation.latitude);
    const lng = parseFloat(newLocation.longitude);

    if (isNaN(lat) || isNaN(lng) || 
        lat < -90 || lat > 90 || 
        lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates');
      return;
    }

    try {
      await addLocation(
        newLocation.name.toLowerCase(),
        newLocation.description.toLowerCase(),
        lat,
        lng
      );
      
      setNewLocation({ name: '', description: '', latitude: '', longitude: '' });
      toast.success('Location added successfully!');
    } catch (error) {
      toast.error('Failed to add location');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="cursor-pointer w-12 h-12">
          <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt="avatar" />
          <AvatarFallback>{user?.user_metadata?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-80 mx-4" align="end" side="bottom" sideOffset={5}>
        <div className="grid gap-4">
          <div className="space-y-2">
            {user ? (
              <>
                <h4 className="font-medium leading-none">Welcome, {user.user_metadata?.name || 'User'}</h4>
                <p className="text-sm text-muted-foreground">
                  What would you like to do?
                </p>
              </>
            ) : (
              <>
                <h4 className="font-medium leading-none">Welcome to Map Biji</h4>
                <p className="text-sm text-muted-foreground">
                  Please sign in to add locations
                </p>
              </>
            )}
          </div>
          
          {/* Search Popover - Always visible */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="width" className="flex items-center justify-between w-[285px] cursor-pointer hover:text-blue-500">
                    <span>Cari</span>
                    <Search strokeWidth={2.5} className="h-4 w-4" />
                  </Label>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 mx-4 my-[70px] " align="start" side="right" sideOffset={5}>
              <div className="space-y-4">
                <h4 className="font-medium">Pencarian</h4>
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="Cari lokasi..." 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="search-results-container">
                      {locations
                        .filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(loc => (
                          <div 
                            key={loc.id}
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                            onClick={() => {
                              setSelectedLocation([loc.longitude, loc.latitude]);
                              handleSearch(loc.name);
                            }}
                            style={{
                              borderLeft: `4px solid ${getLocationColor(loc.name)}`
                            }}
                          >
                            <div>
                              <p className="font-medium">{toTitleCase(loc.name)}</p>
                              <p className="text-sm text-gray-500">{toTitleCase(loc.description)}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Add Popover - Only visible when authenticated */}
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="width" className="flex items-center justify-between w-[285px] cursor-pointer hover:text-blue-500">
                      <span>Tambah</span>
                      <Plus strokeWidth={2.5} className="h-4 w-4" />
                    </Label>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 mx-4 my-[70px]" align="center" side="right" sideOffset={5}>
                <div className="space-y-4">
                  <h4 className="font-medium">Tambah Lokasi Baru</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Nama lokasi..."
                        value={newLocation.name}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Textarea
                        placeholder="Deskripsi lokasi..."
                        value={newLocation.description}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            placeholder="-6.2088"
                            value={newLocation.latitude}
                            onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            placeholder="106.8456"
                            value={newLocation.longitude}
                            onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Latitude: -90 to 90, Longitude: -180 to 180
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!newLocation.latitude || !newLocation.longitude}
                      >
                        Simpan Lokasi
                      </Button>
                    </div>
                  </form>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button 
              className="w-full"
              onClick={() => router.push('/auth')}
            >
              Sign In to Add Locations
            </Button>
          )}

        </div>
      </PopoverContent>
    </Popover>
  );
}
