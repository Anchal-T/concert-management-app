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
  Building2,
  MoreHorizontal,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { AddVenueDialog } from './AddVenueDialog';

export function VenuesList() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter venues based on search query
  const filteredVenues = venues.filter((venue) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const name = (venue.name || '').toLowerCase();
    const city = (venue.city || '').toLowerCase();
    const state = (venue.state || '').toLowerCase();
    return name.includes(query) || city.includes(query) || state.includes(query);
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Venues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-black tracking-tight">Venues ({venues.length})</h2>
          <div className="relative group min-w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by venue name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <AddVenueDialog />
        </div>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-32 bg-card/40 rounded-3xl border border-dashed border-border/50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-accent/20 flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No venues found</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Start by adding your first performance venue to the registry.
          </p>
        </div>
      ) : (
        <div className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Venue Name</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Location</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Capacity</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVenues.map((venue) => (
                  <TableRow key={venue.id} className="group hover:bg-accent/10 border-border/50 transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-border/50 shadow-sm">
                          <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">{venue.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Premium Venue</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {venue.city}, {venue.state}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-bold">{(venue.capacity || 0).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-500/20">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" /> Active
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                          onClick={() => handleDelete(venue.id, venue.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
