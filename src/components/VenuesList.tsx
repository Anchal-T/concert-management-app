"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Edit2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export function VenuesList() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVenues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch venues');
    } else {
      setVenues(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    const { error } = await supabase.from('venues').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete venue');
    } else {
      toast.success('Venue deleted');
      fetchVenues();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <MapPin className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
        <h3 className="text-lg font-medium text-black dark:text-white">No venues found</h3>
        <p className="text-zinc-500 mt-1">Add your first venue to start scheduling concerts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell className="font-medium text-black dark:text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-zinc-400" />
                {venue.name}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">
                {venue.city ? `${venue.city}${venue.state ? `, ${venue.state}` : ''}` : 'N/A'}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                    {venue.capacity?.toLocaleString() || 'Unknown'}
                </div>
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                {venue.address || '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-black dark:hover:text-white">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600" onClick={() => handleDelete(venue.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
