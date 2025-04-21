'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_by: string;
  created_at: string;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  // Add new location
  const addLocation = async (name: string, description: string, latitude: number, longitude: number) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([
          {
            name,
            description,
            latitude,
            longitude,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setLocations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
      throw err;
    }
  };

  // Subscribe to changes
  useEffect(() => {
    fetchLocations();

    const channel = supabase
      .channel('locations_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'locations' 
        }, 
        payload => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    locations,
    loading,
    error,
    addLocation,
    refreshLocations: fetchLocations,
  };
} 