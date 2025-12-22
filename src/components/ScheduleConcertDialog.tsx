"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

export function ScheduleConcertDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const [artistsRes, venuesRes] = await Promise.all([
          supabase.from('artists').select('id, name').order('name'),
          supabase.from('venues').select('id, name').order('name')
        ]);
        setArtists(artistsRes.data || []);
        setVenues(venuesRes.data || []);
      };
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const artist_id = formData.get('artist_id') as string;
    const venue_id = formData.get('venue_id') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const ticket_price = parseFloat(formData.get('ticket_price') as string);
    const status = formData.get('status') as string;

    const { error } = await supabase
      .from('concerts')
      .insert([{ 
        artist_id, 
        venue_id, 
        date, 
        time: time || null, 
        ticket_price: isNaN(ticket_price) ? null : ticket_price,
        status 
      }]);

    setLoading(false);
    if (error) {
      toast.error('Failed to schedule concert');
    } else {
      toast.success('Concert scheduled successfully');
      setOpen(false);
      router.refresh();
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Schedule Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0B101B] border-border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Schedule New Event</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details below to create a new event in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="artist_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Artist</Label>
                <Select name="artist_id" required>
                  <SelectTrigger className="bg-accent/20 border-border rounded-xl h-11 text-white">
                    <SelectValue placeholder="Select Artist" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B101B] border-border">
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="venue_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Venue</Label>
                <Select name="venue_id" required>
                  <SelectTrigger className="bg-accent/20 border-border rounded-xl h-11 text-white">
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B101B] border-border">
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="bg-accent/20 border-border rounded-xl h-11 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  className="bg-accent/20 border-border rounded-xl h-11 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket_price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ticket Price ($)</Label>
                <Input
                  id="ticket_price"
                  name="ticket_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-accent/20 border-border rounded-xl h-11 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select name="status" defaultValue="Upcoming">
                  <SelectTrigger className="bg-accent/20 border-border rounded-xl h-11 text-white">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B101B] border-border">
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-bold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
