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
        <Button className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Concert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule New Concert</DialogTitle>
            <DialogDescription>
              Link an artist with a venue and set the event details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="artist_id">Artist</Label>
              <Select name="artist_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Artist" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue_id">Venue</Label>
              <Select name="venue_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket_price">Ticket Price ($)</Label>
                <Input id="ticket_price" name="ticket_price" type="number" step="0.01" placeholder="49.99" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="confirmed">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || artists.length === 0 || venues.length === 0}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
