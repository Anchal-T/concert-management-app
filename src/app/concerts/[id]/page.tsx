"use client";

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Edit2,
  Ban,
  Trash2,
  Users2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Tag,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface EventStats {
  totalSold: number;
  totalRevenue: number;
  uniqueBuyers: number;
}

// Formats currency consistently for the Event Summary sidebar.
function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// Returns a safe Date instance for rendering, or null if parsing fails.
function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function ConcertDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [concert, setConcert] = useState<any>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<EventStats>({ totalSold: 0, totalRevenue: 0, uniqueBuyers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch concert, tags, and stats in parallel
        const [concertRes, tagsRes, statsRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events/${id}/tags`),
          fetch(`/api/events/${id}/stats`),
        ]);

        if (!concertRes.ok) throw new Error('Failed to fetch concert');
        const concertData = await concertRes.json();
        setConcert(concertData);

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalSold: statsData.totalSold || 0,
            totalRevenue: statsData.totalRevenue || 0,
            uniqueBuyers: statsData.uniqueBuyers || 0,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Event Intel...</p>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="text-center py-40">
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <Button variant="link" className="mt-4" asChild>
          <a href="/concerts">Back to Events</a>
        </Button>
      </div>
    );
  }

  // Normalize data for display (avoid external placeholder assets).
  const artistImage: string | null = concert.artist?.imageUrl || concert.artist?.image_url || null;
  const artistName = concert.artist?.name || 'Artist';
  const venueName = concert.venue?.name || 'Venue';
  const eventTitle = concert.title || `${artistName} vs. ${venueName}`;
  const eventDate = parseDate(concert.date);
  const statusLabel = String(concert.status || 'Draft');

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Hero Card */}
        <div className="lg:col-span-9 bg-card/40 border border-border/50 rounded-3xl overflow-hidden relative">
          <div className="h-48 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-[#04070D] to-transparent z-10" />
            {artistImage ? (
              <img src={artistImage} alt={artistName} className="w-full h-full object-cover opacity-70" />
            ) : (
              <div className="w-full h-full bg-accent/20" />
            )}
          </div>

          <div className="p-8 -mt-20 relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-[#04070D] overflow-hidden bg-accent shadow-2xl">
                  {artistImage ? (
                    <img src={artistImage} alt={artistName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground font-black">
                      {artistName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold tracking-tight line-clamp-1">{eventTitle}</h1>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {statusLabel}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-2xl line-clamp-2">
                    {concert.description || concert.artist?.bio || 'No description available for this event.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-xl bg-accent/20 border-transparent hover:bg-accent/40">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl bg-accent/20 border-transparent hover:bg-accent/40">
                  <Ban className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl bg-accent/20 border-transparent hover:bg-rose-500/20 hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Date & Time</p>
                  <p className="text-sm font-bold">
                    {eventDate ? format(eventDate, 'dd MMM, yyyy') : 'TBD'}
                    {concert.time ? ` — ${concert.time}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Tags</p>
                  <p className="text-sm font-bold line-clamp-1">
                    {tags.length ? tags.map((t) => t.name).join(', ') : 'None'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-bold line-clamp-1">
                    {concert.venue?.name ? `${concert.venue?.name}${concert.venue?.city ? `, ${concert.venue?.city}` : ''}` : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Summary */}
        <div className="lg:col-span-3">
          <div className="bg-card/40 border border-border/50 rounded-3xl p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Event Summary</h3>

            <div className="flex-1 space-y-10">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Tickets Sold</p>
                <p className="text-3xl font-black tracking-tight">{stats.totalSold.toLocaleString()}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-black tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users2 className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Unique Attendees</p>
                <p className="text-3xl font-black tracking-tight">{stats.uniqueBuyers.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-center gap-3">
              <button type="button" className="p-2 rounded-xl hover:bg-accent/20 text-muted-foreground" aria-label="Previous">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-border" />
                <div className="w-2 h-2 rounded-full bg-border" />
              </div>
              <button type="button" className="p-2 rounded-xl hover:bg-accent/20 text-muted-foreground" aria-label="Next">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teams + Tags */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 bg-card/40 border border-border/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teams</p>
            <a href="/artists" className="text-[10px] font-bold text-muted-foreground hover:text-foreground">See all</a>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/40 overflow-hidden border border-border/50">
                {artistImage ? (
                  <img src={artistImage} alt={artistName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black">{artistName.substring(0, 2).toUpperCase()}</div>
                )}
              </div>
              <p className="text-sm font-bold line-clamp-1">{artistName}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/40 overflow-hidden border border-border/50 flex items-center justify-center">
                <span className="text-[10px] font-black">{venueName.substring(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-sm font-bold line-clamp-1">{venueName}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-9 bg-card/40 border border-border/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</p>
            <a href="/tags" className="text-[10px] font-bold text-muted-foreground hover:text-foreground">See all</a>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[10px] font-bold border-border bg-accent/20 text-foreground"
                >
                  {tag.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden">
        <Tabs defaultValue="collections" className="w-full">
          <div className="bg-accent/20 border-b border-border/50 px-6">
            <TabsList className="bg-transparent h-12 gap-6">
              <TabsTrigger value="collections" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none font-bold text-xs px-0 border-b-2 border-transparent">
                Ticket Collections
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none font-bold text-xs px-0 border-b-2 border-transparent">
                Ticket Categories
              </TabsTrigger>
              <TabsTrigger value="attendees" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none font-bold text-xs px-0 border-b-2 border-transparent">
                Attendee List
              </TabsTrigger>
              <TabsTrigger value="promotions" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none font-bold text-xs px-0 border-b-2 border-transparent">
                Promotions / Discounts
              </TabsTrigger>
              <TabsTrigger value="seats" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none font-bold text-xs px-0 border-b-2 border-transparent">
                Seat chart
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="collections" className="mt-0 p-8 min-h-[360px]">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-bold">Ticket Collection</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-lg h-9 w-9 bg-accent/10 border-transparent">
                  <span className="text-muted-foreground">↗</span>
                </Button>
                <Button className="rounded-lg h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> Attach Collection
                </Button>
              </div>
            </div>

            <div className="h-[260px] flex flex-col items-center justify-center text-center bg-accent/10 border border-border/30 rounded-2xl">
              <p className="text-sm font-bold">No Ticket Collection Attached</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-md">
                Attach a ticket collection to enable publishing and sales for {eventTitle}.
              </p>
            </div>
          </TabsContent>

          {(['categories', 'attendees', 'promotions', 'seats'] as const).map((key) => (
            <TabsContent key={key} value={key} className="mt-0 p-8 min-h-[360px]">
              <div className="h-[260px] flex flex-col items-center justify-center text-center bg-accent/10 border border-border/30 rounded-2xl">
                <p className="text-sm font-bold">No data available</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-md">
                  This section is ready for your existing backend wiring when available.
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
