'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocations } from '@/app/hooks/useLocations';
import { useLocationContext } from '@/app/contexts/LocationContext';
import { getLocationColor, toTitleCase } from '@/app/utils/colorUtils';

interface MapProps {
  className?: string;
}

export default function Map({ className = '' }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const tempMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const { selectedLocation } = useLocationContext();
  const { locations } = useLocations();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox token is not configured');
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.8456, -6.2088], // Jakarta coordinates
        zoom: 12
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each location
    locations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.background = getLocationColor(location.name);
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(
          `<h3 class="font-bold">${toTitleCase(location.name)}</h3>
           <p>${toTitleCase(location.description)}</p>`
        );

      // Add popup open/close handlers
      popup.on('open', () => {
        // Remove pulse from all markers first
        document.querySelectorAll('.marker').forEach(m => {
          m.classList.remove('marker-pulse');
        });
        // Add pulse to current marker
        el.classList.add('marker-pulse');
        
        // Zoom to location
        if (map.current) {
          map.current.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 16,
            essential: true,
            duration: 1000
          });
        }
      });

      popup.on('close', () => {
        // Remove pulse when popup is closed
        el.classList.remove('marker-pulse');
      });

      const marker = new mapboxgl.Marker({
        element: el
      })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  }, [locations]);

  // Update map center and temporary marker when selected location changes
  useEffect(() => {
    if (!map.current || !selectedLocation) return;

    // Remove existing temporary marker
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    // Add new temporary marker with circular style
    const el = document.createElement('div');
    el.className = 'marker-pulse-red';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.background = '#ef4444';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';

    tempMarkerRef.current = new mapboxgl.Marker({
      element: el
    })
      .setLngLat(selectedLocation)
      .addTo(map.current);

    // Fly to the selected location
    map.current.flyTo({
      center: selectedLocation,
      zoom: 14,
      essential: true,
      duration: 1000
    });
  }, [selectedLocation]);

  return (
    <div className={`fixed inset-0 w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 