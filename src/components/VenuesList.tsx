"use client";

import { useEffect, useState } from 'react';
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
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

export function VenuesList() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/venues');
      if (!res.ok) throw new Error('Failed to fetch venues');
      const data = await res.json();
      setVenues(data || []);
    } catch (error) {
      toast.error('Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/venues/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');

      toast.success(`${name} removed from registry`);
      fetchVenues();
    } catch (error) {
      toast.error(`Failed to delete ${name}`);
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
    <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold">Registry ({venues.length})</h2>
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by venue name, city..."
              className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-lg h-10 px-4 text-sm font-medium bg-accent/20 border-transparent hover:bg-accent/40">
            Filter <Filter className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Venue Name</TableHead>
              <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Capacity</TableHead>
              <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-medium text-muted-foreground px-6 py-3 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.map((venue) => (
              <TableRow key={venue.id} className="group hover:bg-accent/10 border-border/50 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{venue.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {venue.city}, {venue.state}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {venue.capacity?.toLocaleString() || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-accent/30 text-[10px] font-medium text-muted-foreground border border-border">
                    {venue.type || 'Indoor'}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(venue.id, venue.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
