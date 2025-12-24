"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Pencil } from 'lucide-react';

type EventLike = {
  id: number | string;
  title?: string | null;
  description?: string | null;
  date?: string | Date | null;
  price?: number | string | null;
  status?: string | null;
  artistId?: number | string | null;
  venueId?: number | string | null;
  artist?: { id?: number | string; name?: string | null } | null;
  venue?: { id?: number | string; name?: string | null; capacity?: number | null } | null;
};

interface EditEventDialogProps {
  event: EventLike;
  trigger?: React.ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  onSuccess?: () => void;
}

/**
 * Converts an event date into `YYYY-MM-DD` input value.
 * Exists to keep form prefill logic consistent across browsers.
 */
function toDateInputValue(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/**
 * Converts an event date into `HH:MM` input value.
 * Exists because the backend stores date+time as a single datetime.
 */
function toTimeInputValue(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(11, 16);
}

/**
 * Opens a dialog for editing an existing event via `PUT /api/events/:id`.
 * Exists to ensure Edit actions in the UI always map to real functionality.
 */
export function EditEventDialog({
  event,
  trigger,
  triggerLabel = 'Edit',
  triggerClassName,
  onSuccess,
}: EditEventDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);

  const eventId = useMemo(() => Number(event?.id), [event?.id]);
  const initialArtistId = String(event?.artistId ?? event?.artist?.id ?? '');
  const initialVenueId = String(event?.venueId ?? event?.venue?.id ?? '');
  const initialStatus = String(event?.status ?? 'draft');

  useEffect(() => {
    if (!open) return;

    /**
     * Loads artists and venues for the edit form selects.
     * Exists to avoid loading this data unless the dialog is opened.
     */
    const fetchData = async () => {
      try {
        const [artistsRes, venuesRes] = await Promise.all([fetch('/api/artists'), fetch('/api/venues')]);
        if (artistsRes.ok) setArtists(await artistsRes.json());
        if (venuesRes.ok) setVenues(await venuesRes.json());
      } catch (error) {
        console.error('Failed to fetch edit form data', error);
      }
    };

    fetchData();
  }, [open]);

  /**
   * Submits the edit form to the API via PUT.
   * Exists to keep the dialog self-contained and reusable.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!Number.isFinite(eventId)) {
      toast.error('Invalid event');
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const artistId = formData.get('artist_id') as string;
    const venueId = formData.get('venue_id') as string;
    const dateStr = (formData.get('date') as string) || '';
    const timeStr = (formData.get('time') as string) || '';
    const price = parseFloat((formData.get('ticket_price') as string) || '0');
    const status = (formData.get('status') as string) || 'draft';

    const dateTime = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;

    const selectedArtist = artists.find((a) => String(a.id) === String(artistId));
    const selectedVenue = venues.find((v) => String(v.id) === String(venueId));
    const title =
      (formData.get('title') as string) ||
      (selectedArtist && selectedVenue ? `${selectedArtist.name} at ${selectedVenue.name}` : event?.title || 'Event');

    const payload = {
      artistId,
      venueId,
      date: dateTime,
      price: Number.isFinite(price) ? price : 0,
      status,
      title,
      totalTickets: selectedVenue?.capacity ?? undefined,
    };

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to update event');
      }

      toast.success('Event updated');
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            className={triggerClassName}
            variant={triggerClassName ? undefined : 'outline'}
          >
            {!triggerClassName && <Pencil className="w-4 h-4 mr-2" />}
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] bg-[#0B101B] border-border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit Event</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the event details. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={event?.title ?? ''}
                className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50"
                placeholder="Event title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="artist_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Artist
                </Label>
                <Select name="artist_id" defaultValue={initialArtistId} required>
                  <SelectTrigger className="bg-accent/20 border-border rounded-xl h-11 text-white">
                    <SelectValue placeholder="Select Artist" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B101B] border-border">
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={String(artist.id)}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="venue_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Venue
                </Label>
                <Select name="venue_id" defaultValue={initialVenueId} required>
                  <SelectTrigger className="bg-accent/20 border-border rounded-xl h-11 text-white">
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B101B] border-border">
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={String(venue.id)}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={toDateInputValue(event?.date)}
                  required
                  className="bg-accent/20 border-border rounded-xl h-11 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Time
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  defaultValue={toTimeInputValue(event?.date)}
                  required
                  className="bg-accent/20 border-border rounded-xl h-11 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="ticket_price"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Ticket Price ($)
                </Label>
                <Input
                  id="ticket_price"
                  name="ticket_price"
                  type="number"
                  step="0.01"
                  defaultValue={event?.price ?? ''}
                  required
                  className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </Label>
                <Select name="status" defaultValue={initialStatus}>
                  <SelectTrigger className="bg-accent/20 border-border rounded-xl h-11 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B101B] border-border">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl h-11 px-6 font-bold hover:bg-accent/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
