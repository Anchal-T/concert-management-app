"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Trash2, 
  Edit2, 
  Loader2, 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Navigation2,
  Building2
} from 'lucide-react';
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

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from('venues').delete().eq('id', id);

    if (error) {
      toast.error(`Failed to delete ${name}`);
    } else {
      toast.success(`${name} removed from registry`);
      fetchVenues();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Venues...</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-32 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">No venues found</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          Start by adding your first performance venue to the registry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Registry ({venues.length})</h2>
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by venue name, city..."
              className="w-full bg-accent/30 border border-transparent focus:border-primary/20 rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
            <Navigation2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-accent/30">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-semibold px-6 py-4">Venue Details</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status & Type</TableHead>
              <TableHead className="font-semibold px-6 py-4">Capacity</TableHead>
              <TableHead className="font-semibold px-6 py-4">Address</TableHead>
              <TableHead className="font-semibold px-6 py-4 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.map((venue) => (
              <TableRow key={venue.id} className="group hover:bg-accent/20 border-border transition-colors">
                <TableCell className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-base">{venue.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{venue.city}, {venue.state}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-medium">Active</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black ml-2 tracking-widest px-2 py-0.5 bg-accent rounded-full">Arena</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {venue.capacity?.toLocaleString() || '0'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <p className="text-sm text-muted-foreground max-w-[200px] truncate">{venue.address || '-'}</p>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(venue.id, venue.name)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-border flex justify-center bg-accent/5">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Verified Locations Only</p>
      </div>
    </div>
  );
}
