"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  MoreHorizontal,
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  Clock,
  XCircle,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScheduleConcertDialog } from '@/components/ScheduleConcertDialog';
import { EditEventDialog } from '@/components/EditEventDialog';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { toast } from 'sonner';
import Link from 'next/link';

type TimeRangeKey = '1D' | '7D' | '1M' | '3M' | 'CUSTOM';

interface EventLike {
  id: string | number;
  status?: string;
  date?: string;
  time?: string;
  soldTickets?: number;
  totalTickets?: number;
  artist?: { name?: string; imageUrl?: string | null };
  venue?: { name?: string; city?: string };
}

// Parses a server-provided event date into a Date, returning null for invalid input.
function parseEventDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Maps an event status string into a normalized bucket used for overview counts.
function normalizeStatus(status: unknown): 'upcoming' | 'ongoing' | 'cancelled' | 'other' {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === 'scheduled' || normalized === 'upcoming' || normalized === 'draft') return 'upcoming';
  if (normalized === 'confirmed' || normalized === 'ongoing') return 'ongoing';
  if (normalized === 'cancelled') return 'cancelled';
  return 'other';
}

// Computes a [start,end) window for the selected time-range.
// For event management, we look FORWARD from now (upcoming events) instead of backward.
function getWindow(range: TimeRangeKey, now: Date): { start: Date; end: Date; days: number | null } {
  const start = now;
  if (range === 'CUSTOM') return { start: new Date(0), end: new Date('2099-12-31'), days: null };

  const days = range === '1D' ? 1 : range === '7D' ? 7 : range === '1M' ? 30 : 90;
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return { start, end, days };
}

// Calculates the percent change between the current period and previous period.
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

// Computes a safe ticket progress percentage (0..100) for rendering the progress bar.
// This exists to avoid duplicating null/undefined handling logic across the UI.
function getTicketProgressPercent(event: Pick<EventLike, 'soldTickets' | 'totalTickets'>): number {
  const totalTickets = event.totalTickets ?? 0;
  const soldTickets = event.soldTickets ?? 0;

  if (totalTickets <= 0) return 0;

  return Math.min((soldTickets / totalTickets) * 100, 100);
}

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<EventLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRangeKey>('7D');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 7;

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = (await res.json()) as EventLike[];
          setConcerts(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch concerts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string | number) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete event');
      toast.success('Event deleted successfully');
      // Refresh the list
      const newRes = await fetch('/api/events');
      if (newRes.ok) {
        const data = (await newRes.json()) as EventLike[];
        setConcerts(data || []);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  useEffect(() => {
    setPage(1);
  }, [range, search]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-500/20"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Upcoming</div>;
      case 'confirmed':
      case 'ongoing':
        return <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-blue-500/20"><div className="w-1 h-1 rounded-full bg-blue-500" /> Ongoing</div>;
      case 'cancelled':
        return <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-rose-500/20"><div className="w-1 h-1 rounded-full bg-rose-500" /> Cancelled</div>;
      case 'completed':
        return <div className="flex items-center gap-2 text-zinc-400 bg-zinc-400/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-400/20"><div className="w-1 h-1 rounded-full bg-zinc-400" /> Completed</div>;
      default:
        return <div className="flex items-center gap-2 text-zinc-500 bg-zinc-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-500/20"><div className="w-1 h-1 rounded-full bg-zinc-500" /> {status}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Events...</p>
      </div>
    );
  }

  const now = new Date();
  const { start, end, days } = getWindow(range, now);
  // For comparison, previous window looks forward from (now - days)
  const previousWindowStart = days === null ? new Date(0) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousWindowEnd = days === null ? new Date(0) : now;

  const inWindow = (event: EventLike, windowStart: Date, windowEnd: Date) => {
    const date = parseEventDate(event.date);
    if (!date) return false;
    return date >= windowStart && date < windowEnd;
  };

  const baseEvents = range === 'CUSTOM'
    ? concerts
    : concerts.filter((event) => inWindow(event, start, end));

  const previousEvents = days === null
    ? []
    : concerts.filter((event) => inWindow(event, previousWindowStart, previousWindowEnd));

  const statsCurrent = baseEvents.reduce(
    (acc, event) => {
      acc.total += 1;
      const bucket = normalizeStatus(event.status);
      if (bucket === 'upcoming') acc.upcoming += 1;
      if (bucket === 'ongoing') acc.ongoing += 1;
      if (bucket === 'cancelled') acc.cancelled += 1;
      return acc;
    },
    { total: 0, upcoming: 0, ongoing: 0, cancelled: 0 }
  );

  const statsPrevious = previousEvents.reduce(
    (acc, event) => {
      acc.total += 1;
      const bucket = normalizeStatus(event.status);
      if (bucket === 'upcoming') acc.upcoming += 1;
      if (bucket === 'ongoing') acc.ongoing += 1;
      if (bucket === 'cancelled') acc.cancelled += 1;
      return acc;
    },
    { total: 0, upcoming: 0, ongoing: 0, cancelled: 0 }
  );

  const totalChange = days === null ? 0 : percentChange(statsCurrent.total, statsPrevious.total);
  const upcomingChange = days === null ? 0 : percentChange(statsCurrent.upcoming, statsPrevious.upcoming);
  const ongoingChange = days === null ? 0 : percentChange(statsCurrent.ongoing, statsPrevious.ongoing);
  const cancelledChange = days === null ? 0 : percentChange(statsCurrent.cancelled, statsPrevious.cancelled);

  const searchLower = search.trim().toLowerCase();
  const searchedEvents = searchLower
    ? baseEvents.filter((event) => {
      const artist = event.artist?.name ?? '';
      const venue = event.venue?.name ?? '';
      const city = event.venue?.city ?? '';
      return `${artist} ${venue} ${city}`.toLowerCase().includes(searchLower);
    })
    : baseEvents;

  const totalPages = Math.max(1, Math.ceil(searchedEvents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEvents = searchedEvents.slice(pageStart, pageStart + pageSize);

  const renderChangePill = (value: number) => {
    const isPositive = value >= 0;
    const abs = Math.abs(value);
    const text = `${abs < 0.1 ? 0 : abs.toFixed(0)}%`;
    return (
      <div className={
        `flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
        }`
      }>
        <span className={isPositive ? 'rotate-0' : 'rotate-180'}>↑</span> {text}
      </div>
    );
  };

  const timeRanges: TimeRangeKey[] = ['1D', '7D', '1M', '3M', 'CUSTOM'];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Event Overview */}
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold text-foreground">Event</h2>
          <p className="text-sm font-bold text-muted-foreground">Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/20 border border-border/50 rounded-xl p-1">
          {timeRanges.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={
                `px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${range === key
                  ? 'bg-accent/40 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {key === 'CUSTOM' ? 'Custom' : key}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-card/40 border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-md bg-amber-400" />
            <p className="text-xs font-bold text-muted-foreground">Total events</p>
          </div>
          <p className="text-3xl font-black tracking-tight">{statsCurrent.total.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4">
            {renderChangePill(totalChange)}
            <p className="text-[10px] text-muted-foreground font-bold">From last week</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-md bg-blue-500" />
            <p className="text-xs font-bold text-muted-foreground">Upcoming events</p>
          </div>
          <p className="text-3xl font-black tracking-tight">{statsCurrent.upcoming.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4">
            {renderChangePill(upcomingChange)}
            <p className="text-[10px] text-muted-foreground font-bold">From last week</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-md bg-emerald-500" />
            <p className="text-xs font-bold text-muted-foreground">Ongoing events</p>
          </div>
          <p className="text-3xl font-black tracking-tight">{statsCurrent.ongoing.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4">
            {renderChangePill(ongoingChange)}
            <p className="text-[10px] text-muted-foreground font-bold">From last week</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-4 h-4 text-rose-500" />
            <p className="text-xs font-bold text-muted-foreground">Cancelled events</p>
          </div>
          <p className="text-3xl font-black tracking-tight">{statsCurrent.cancelled.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4">
            {renderChangePill(cancelledChange)}
            <p className="text-[10px] text-muted-foreground font-bold">From last week</p>
          </div>
        </div>
      </div>

      <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold">Events ({searchedEvents.length.toLocaleString()})</h2>
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by event, location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <ScheduleConcertDialog
              triggerLabel="Create Event"
              triggerClassName="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 px-5 h-10 font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Event Name</TableHead>
                <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Date & Time</TableHead>
                <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Tickets Sold</TableHead>
                <TableHead className="font-medium text-muted-foreground px-6 py-3 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-medium text-muted-foreground px-6 py-3 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageEvents.length > 0 ? (
                pageEvents.map((concert) => (
                  <TableRow key={concert.id} className="group hover:bg-accent/10 border-border/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <Link href={`/concerts/${concert.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center overflow-hidden border border-border/50">
                          {concert.artist?.imageUrl ? (
                            <img src={concert.artist.imageUrl} alt={concert.artist?.name ?? 'Artist'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-black text-foreground">
                              {(concert.artist?.name ?? 'EV').substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {concert.artist?.name ?? 'Untitled Event'}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 line-clamp-1">
                            {concert.venue?.name ?? 'Venue TBD'}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{concert.date ? format(new Date(concert.date), 'dd MMM, yyyy') : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{concert.time || '19:00'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{concert.venue?.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 ml-5">{concert.venue?.city}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-bold">{(concert.soldTickets || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">/ {(concert.totalTickets || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-24 h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${getTicketProgressPercent(concert)}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(concert.status || 'scheduled')}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent/40">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#0B101B] border-border/50">
                          <DropdownMenuItem asChild>
                            <Link href={`/concerts/${concert.id}`} className="flex items-center gap-2 cursor-pointer">
                              <Eye className="w-4 h-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/50" />
                          <ConfirmActionDialog
                            title="Delete Event"
                            description="This will permanently delete this event. This action cannot be undone."
                            confirmLabel="Delete"
                            confirmVariant="destructive"
                            onConfirm={() => handleDeleteEvent(concert.id)}
                            trigger={
                              <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-rose-500 hover:bg-rose-500/10 rounded-sm cursor-pointer">
                                <Trash2 className="w-4 h-4" /> Delete Event
                              </button>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No events found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {searchedEvents.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, searchedEvents.length)} of {searchedEvents.length} events
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-lg h-8 px-3 text-xs bg-accent/10 border-transparent"
            >
              Previous
            </Button>
            <div className="hidden md:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                const value = index + 1;
                const isActive = value === safePage;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={
                      `h-8 w-8 rounded-lg text-xs font-bold transition-colors ${isActive ? 'bg-accent/40 text-foreground' : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                      }`
                    }
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-lg h-8 px-3 text-xs bg-accent/10 border-transparent"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

