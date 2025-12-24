"use client";

import { useCallback, useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  XCircle,
  Plus,
  Filter,
  Upload,
  Search,
  ArrowUpRight,
  Loader2,
  MapPin,
  Tag,
  Info,
  Ticket,
  DollarSign,
  Users2,
  Edit2,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScheduleConcertDialog } from './ScheduleConcertDialog';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { EditEventDialog } from '@/components/EditEventDialog';

type DashboardEventStats = {
  totalSold: number;
  totalRevenue: number;
  uniqueBuyers: number;
};

// Renders the dashboard overview and events table by loading event data from the API and presenting summary metrics.
export default function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    cancelled: 0
  });
  const [concerts, setConcerts] = useState<any[]>([]);
  const [featuredConcert, setFeaturedConcert] = useState<any | null>(null);
  const [featuredStats, setFeaturedStats] = useState<DashboardEventStats>({
    totalSold: 0,
    totalRevenue: 0,
    uniqueBuyers: 0
  });
  const [featuredTags, setFeaturedTags] = useState<{ id: number; name: string; color?: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Updates derived dashboard summary counts from a list of events.
   * Exists to keep the stats logic deterministic and reusable.
   */
  const computeDashboardStats = useCallback((allConcerts: any[]) => {
    const upcoming = allConcerts.filter(
      (c: any) => c.status?.toLowerCase() === 'upcoming' || c.status?.toLowerCase() === 'scheduled'
    ).length;
    const ongoing = allConcerts.filter(
      (c: any) => c.status?.toLowerCase() === 'ongoing' || c.status?.toLowerCase() === 'confirmed'
    ).length;
    const cancelled = allConcerts.filter((c: any) => c.status?.toLowerCase() === 'cancelled').length;

    setStats({
      total: allConcerts.length,
      upcoming,
      ongoing,
      cancelled
    });
  }, []);

  /**
   * Reloads dashboard events and rehydrates the featured hero.
   * Exists because the dashboard uses client-side fetching and must refresh after CRUD actions.
   */
  const refreshDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');

      const allConcerts = await res.json();
      setConcerts(allConcerts);
      computeDashboardStats(allConcerts);

      const featured = pickFeaturedConcert(allConcerts);
      setFeaturedConcert(featured);

      const eventId = Number(featured?.id);
      if (Number.isFinite(eventId)) {
        await hydrateFeaturedConcert(eventId);
      } else {
        setFeaturedStats({ totalSold: 0, totalRevenue: 0, uniqueBuyers: 0 });
        setFeaturedTags([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [computeDashboardStats]);

  useEffect(() => {
    // Fetches dashboard data and derives summary stats; kept here to run once on mount.
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Selects a featured event for the dashboard hero (prefers nearest upcoming by date).
  const pickFeaturedConcert = (allConcerts: any[]): any | null => {
    if (!Array.isArray(allConcerts) || allConcerts.length === 0) return null;

    const now = Date.now();
    const byDate = [...allConcerts].sort((a, b) => {
      const aTime = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });

    const upcoming = byDate.find((c) => {
      const time = c?.date ? new Date(c.date).getTime() : Number.NEGATIVE_INFINITY;
      return Number.isFinite(time) && time >= now;
    });

    return upcoming ?? byDate[0] ?? null;
  };

  // Loads stats and tags for the dashboard hero using existing event-specific endpoints.
  const hydrateFeaturedConcert = async (eventId: number) => {
    try {
      const [statsRes, tagsRes] = await Promise.all([
        fetch(`/api/events/${eventId}/stats`),
        fetch(`/api/events/${eventId}/tags`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setFeaturedStats({
          totalSold: Number(data?.totalSold ?? 0),
          totalRevenue: Number(data?.totalRevenue ?? 0),
          uniqueBuyers: Number(data?.uniqueBuyers ?? 0)
        });
      }

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setFeaturedTags(Array.isArray(data) ? data : []);
      }
    } catch {
      // Dashboard hero should degrade gracefully if these endpoints fail.
      setFeaturedStats({ totalSold: 0, totalRevenue: 0, uniqueBuyers: 0 });
      setFeaturedTags([]);
    }
  };

  // Maps an event status string to a styled badge for consistent visual presentation across the table.
  const getStatusBadge = (status: string) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
      case 'draft':
        return <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-500/20"><div className="w-1 h-1 rounded-full bg-emerald-500" /> {status.charAt(0).toUpperCase() + status.slice(1)}</div>;
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

  // Formats money values for the dashboard hero sidebar.
  const formatCurrency = (value: number): string => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return safeValue.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  };

  // Computes a display title for an event while keeping it purely data-driven.
  const getEventTitle = (concert: any): string => {
    if (!concert) return 'Event Details';
    if (typeof concert?.title === 'string' && concert.title.trim()) return concert.title;
    const artistName = concert?.artist?.name || 'Artist';
    const venueName = concert?.venue?.name || 'Venue';
    return `${artistName} vs. ${venueName}`;
  };

  // Compute featured event metadata before any early returns to satisfy Rules of Hooks
  const featuredEventId = useMemo(() => Number(featuredConcert?.id), [featuredConcert?.id]);
  const isFeaturedEventValid = Number.isFinite(featuredEventId);
  const isFeaturedCancelled = String(featuredConcert?.status || '').toLowerCase() === 'cancelled';

  // Filter concerts based on search query
  const filteredConcerts = useMemo(() => {
    if (!searchQuery.trim()) return concerts;
    const query = searchQuery.toLowerCase().trim();
    return concerts.filter((concert) => {
      const artistName = (concert?.artist?.name || '').toLowerCase();
      const venueName = (concert?.venue?.name || '').toLowerCase();
      const venueCity = (concert?.venue?.city || '').toLowerCase();
      const title = (concert?.title || '').toLowerCase();
      return artistName.includes(query) || venueName.includes(query) || venueCity.includes(query) || title.includes(query);
    });
  }, [concerts, searchQuery]);

  /**
   * Updates the featured event status using the existing API.
   * Exists to ensure the dashboard "disable" button always performs a real mutation.
   */
  const updateFeaturedStatus = useCallback(
    async (nextStatus: string) => {
      if (!isFeaturedEventValid) return;

      const res = await fetch(`/api/events/${featuredEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to update event');
      }
    },
    [featuredEventId, isFeaturedEventValid]
  );

  /**
   * Deletes the featured event using the existing API.
   * Exists to keep the hero delete button non-decorative and safe.
   */
  const deleteFeaturedEvent = useCallback(async () => {
    if (!isFeaturedEventValid) return;

    const res = await fetch(`/api/events/${featuredEventId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Failed to delete event');
    }
  }, [featuredEventId, isFeaturedEventValid]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Overview...</p>
      </div>
    );
  }

  const featuredTitle = getEventTitle(featuredConcert);
  const featuredStatus = String(featuredConcert?.status || 'Draft');
  const featuredDate = featuredConcert?.date ? new Date(featuredConcert.date) : null;
  const featuredVenueAddress =
    featuredConcert?.venue?.address ||
    [featuredConcert?.venue?.name, featuredConcert?.venue?.city, featuredConcert?.venue?.state]
      .filter(Boolean)
      .join(', ');
  const featuredArtistImage = featuredConcert?.artist?.imageUrl || featuredConcert?.artist?.image_url || null;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Section: Event Summary & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Event Card */}
        <div className="lg:col-span-9 backdrop-blur-[25px] bg-card/20 border border-border/40 rounded-xl overflow-hidden relative">
          <div className="relative">
            <div className="relative w-full h-[280px] overflow-hidden bg-accent/10">
              {featuredArtistImage ? (
                <img
                  src={featuredArtistImage}
                  alt={featuredConcert?.artist?.name || 'Event'}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1129&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="No event photo"
                  className="w-full h-full object-cover opacity-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#04070D]/90 via-[#04070D]/40 to-transparent" />
            </div>

            <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-full border-4 border-[#04070D] bg-accent/40 overflow-hidden shadow-2xl">
              {featuredArtistImage ? (
                <img
                  src={featuredArtistImage}
                  alt={featuredConcert?.artist?.name || 'Artist'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-black">
                  {String(featuredConcert?.artist?.name || 'EV').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 pt-14">
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold tracking-tight text-foreground line-clamp-1">
                        {featuredTitle}
                      </h1>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 bg-accent/10">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm capitalize">{featuredStatus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFeaturedEventValid && (
                      <EditEventDialog
                        event={featuredConcert}
                        onSuccess={refreshDashboardData}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-accent/10 border-border/40 hover:bg-accent/20"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}

                    {isFeaturedEventValid && (
                      <ConfirmActionDialog
                        title={isFeaturedCancelled ? 'Enable Event' : 'Disable Event'}
                        description={
                          isFeaturedCancelled
                            ? 'This will mark the event as scheduled again.'
                            : 'This will mark the event as cancelled. You can re-enable it later.'
                        }
                        confirmLabel={isFeaturedCancelled ? 'Enable' : 'Disable'}
                        confirmVariant="default"
                        onConfirm={async () => {
                          try {
                            await updateFeaturedStatus(isFeaturedCancelled ? 'scheduled' : 'cancelled');
                            toast.success(isFeaturedCancelled ? 'Event enabled' : 'Event disabled');
                            await refreshDashboardData();
                            router.refresh();
                          } catch (error: any) {
                            toast.error(error?.message || 'Failed to update event');
                          }
                        }}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-accent/10 border-border/40 hover:bg-accent/20"
                            aria-label={isFeaturedCancelled ? 'Enable' : 'Disable'}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}

                    {isFeaturedEventValid && (
                      <ConfirmActionDialog
                        title="Delete Event"
                        description="This permanently deletes the event and its associated data. This action cannot be undone."
                        confirmLabel="Delete"
                        confirmVariant="destructive"
                        onConfirm={async () => {
                          try {
                            await deleteFeaturedEvent();
                            toast.success('Event deleted');
                            await refreshDashboardData();
                            router.refresh();
                          } catch (error: any) {
                            toast.error(error?.message || 'Failed to delete event');
                          }
                        }}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-accent/10 border-border/40 hover:bg-rose-500/20 hover:text-rose-500"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>

                <p className="mt-4 text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  {featuredConcert?.description || featuredConcert?.artist?.bio || 'No description available.'}
                </p>

                <div className="mt-6 flex gap-3 items-start">
                  <div className="flex-1 border border-border/40 rounded-lg bg-accent/10 p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-foreground">
                          {featuredDate ? format(featuredDate, 'dd MMM, yyyy') : 'TBD'}
                          {featuredDate ? `    ${format(featuredDate, 'p')}` : ''}
                          <span className="text-muted-foreground"> (Local time)</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-foreground line-clamp-1">
                          {featuredTags.length
                            ? featuredTags.map((t) => t.name).join(', ')
                            : 'No tags'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-foreground line-clamp-1">
                          {featuredVenueAddress || 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-56 flex flex-col gap-3">
                    <div className="border border-border/40 rounded-lg bg-accent/10 p-3">
                      <p className="text-xs text-muted-foreground">Policy</p>
                      <p className="text-sm text-foreground mt-2 line-clamp-1">
                        {(featuredConcert?.artist?.name || 'Event') + ' Policy'}
                      </p>
                    </div>

                    <div className="border border-border/40 rounded-lg bg-accent/10 p-3">
                      <p className="text-xs text-muted-foreground">Organizer</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-accent/30 overflow-hidden border border-border/40">
                          {featuredArtistImage ? (
                            <img
                              src={featuredArtistImage}
                              alt={featuredConcert?.artist?.name || 'Organizer'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-foreground">
                              {String(featuredConcert?.artist?.name || 'EV').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-foreground line-clamp-1">
                          {featuredConcert?.artist?.name || 'Organizer'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="backdrop-blur-[25px] bg-card/20 border border-border/40 rounded-xl p-5 h-full flex flex-col">
            <h3 className="text-base font-semibold text-foreground mb-6">Event Summary</h3>

            <div className="flex-1 flex flex-col gap-3">
              <div className="border border-border/40 rounded-lg bg-linear-to-b from-white/5 to-transparent p-4 flex flex-col items-center justify-center gap-3 shadow-xl shadow-black/20">
                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-blue-500 to-blue-400 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground">Total Tickets Sold</p>
                <p className="text-base font-semibold text-foreground">
                  {featuredStats.totalSold.toLocaleString()}
                </p>
              </div>

              <div className="border border-border/40 rounded-lg bg-linear-to-b from-white/5 to-transparent p-4 flex flex-col items-center justify-center gap-3 shadow-xl shadow-black/20">
                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-base font-semibold text-foreground">
                  {formatCurrency(featuredStats.totalRevenue)}
                </p>
              </div>

              <div className="border border-border/40 rounded-lg bg-linear-to-b from-white/5 to-transparent p-4 flex flex-col items-center justify-center gap-3 shadow-xl shadow-black/20">
                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-sky-500 to-sky-400 flex items-center justify-center">
                  <Users2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground">Unique Attendees</p>
                <p className="text-base font-semibold text-foreground">
                  {featuredStats.uniqueBuyers.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/40 flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/20 text-muted-foreground"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/20 text-muted-foreground"
                aria-label="Next"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Ongoing & Cancelled */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card/40 border border-border/50 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-foreground" />
                <div className="w-1 h-1 rounded-full bg-foreground" />
                <div className="w-1 h-1 rounded-full bg-foreground" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-muted-foreground">Ongoing events</h3>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black tracking-tighter">{stats.ongoing.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">From last week</p>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
        </div>

        <div className="bg-card/40 border border-border/50 rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground">Cancelled events</h3>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black tracking-tighter">{stats.cancelled.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" /> 5%
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">From last week</p>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all" />
        </div>

        <div className="bg-card/40 border border-border/50 rounded-3xl p-6 flex flex-col justify-center items-center text-center border-dashed hover:bg-accent/5 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-accent/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">Add New Metric</p>
        </div>
      </div>

      {/* Bottom Section: Events Table */}
      <div className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black tracking-tight">Events ({filteredConcerts.length.toLocaleString()})</h2>
            <div className="relative group min-w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by event, artist, or venue"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <ScheduleConcertDialog />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Event Name</TableHead>
                <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Date & Time</TableHead>
                <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Location</TableHead>
                <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Tickets Sold</TableHead>
                <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConcerts.length > 0 ? (
                filteredConcerts.map((concert) => (
                  <TableRow key={concert.id} className="group hover:bg-accent/10 border-border/50 transition-colors">
                    <TableCell className="px-8 py-5">
                      <Link href={`/concerts/${concert.id}`} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                          {concert?.artist?.imageUrl || concert?.artist?.image_url ? (
                            <img
                              src={concert.artist?.imageUrl || concert.artist?.image_url}
                              alt={concert.artist?.name || 'Artist'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[11px] font-black text-foreground">
                              {String(concert?.artist?.name || 'EV').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">
                          {getEventTitle(concert)}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-sm font-medium text-muted-foreground">
                      {format(new Date(concert.date), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="px-8 py-5 text-sm font-medium text-muted-foreground">
                      {concert.venue?.name}
                    </TableCell>
                    <TableCell className="px-8 py-5 text-sm font-bold text-foreground">
                      {(concert.soldTickets || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      {getStatusBadge(concert.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-accent/20 flex items-center justify-center">
                        <Calendar className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="font-bold tracking-widest uppercase text-xs">No events found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// Combines className inputs into a single string; this avoids repetitive conditional join logic in JSX.
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}