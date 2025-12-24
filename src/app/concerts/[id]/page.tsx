"use client";

import { useCallback, useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Loader2,
  Expand
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { EditEventDialog } from '@/components/EditEventDialog';

interface EventTag {
  id: number;
  name: string;
  color: string;
}

interface EventStats {
  totalSold: number;
  totalRevenue: number;
  uniqueBuyers: number;
}

// Tag color mappings based on Figma design
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'fire works': { bg: 'rgba(241, 81, 80, 0.1)', text: '#F15150' },
  'high spender': { bg: 'rgba(47, 193, 109, 0.1)', text: '#2FC16D' },
  'music lover': { bg: 'rgba(118, 67, 205, 0.1)', text: '#7643CD' },
  'loyal': { bg: 'rgba(252, 142, 10, 0.1)', text: '#FC8E0A' },
  'vip': { bg: 'rgba(0, 181, 212, 0.1)', text: '#00B5D4' },
  'sports': { bg: 'rgba(0, 133, 254, 0.1)', text: '#0085FE' },
  'frequent buyer': { bg: 'rgba(216, 166, 72, 0.1)', text: '#D8A648' },
  'phone verified': { bg: 'rgba(116, 170, 80, 0.1)', text: '#74AA50' },
  'promo code': { bg: 'rgba(215, 91, 143, 0.1)', text: '#D75B8F' },
};

function getTagColors(tagName: string): { bg: string; text: string } {
  const normalized = tagName.toLowerCase().trim();
  return TAG_COLORS[normalized] || { bg: 'rgba(150, 162, 172, 0.1)', text: '#96A2AC' };
}

function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function ConcertDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [concert, setConcert] = useState<any>(null);
  const [tags, setTags] = useState<EventTag[]>([]);
  const [stats, setStats] = useState<EventStats>({ totalSold: 0, totalRevenue: 0, uniqueBuyers: 0 });
  const [loading, setLoading] = useState(true);
  const [summaryIndex, setSummaryIndex] = useState(0);

  const eventId = useMemo(() => Number(id), [id]);
  const isEventIdValid = Number.isFinite(eventId);

  const loadConcertData = useCallback(async () => {
    setLoading(true);
    try {
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
  }, [id]);

  useEffect(() => {
    loadConcertData();
  }, [loadConcertData]);

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

  const artistImage: string | null = concert.artist?.imageUrl || concert.artist?.image_url || null;
  const artistName = concert.artist?.name || 'Artist';
  const venueName = concert.venue?.name || 'Venue';
  const eventTitle = concert.title || `${artistName} vs. ${venueName}`;
  const eventDate = parseDate(concert.date);
  const statusLabel = String(concert.status || 'Draft');
  const isCancelled = statusLabel.toLowerCase() === 'cancelled';

  const updateEventStatus = useCallback(
    async (nextStatus: string) => {
      if (!isEventIdValid) return;
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to update event');
      }
    },
    [eventId, isEventIdValid]
  );

  const deleteEvent = useCallback(async () => {
    if (!isEventIdValid) return;
    const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Failed to delete event');
    }
  }, [eventId, isEventIdValid]);

  // Summary stats carousel
  const summaryStats = [
    { icon: Ticket, label: 'Total Tickets Sold', value: stats.totalSold.toLocaleString(), gradient: 'from-blue-500 to-blue-600' },
    { icon: DollarSign, label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), gradient: 'from-emerald-500 to-emerald-600' },
    { icon: Users2, label: 'Unique Attendees', value: stats.uniqueBuyers.toLocaleString(), gradient: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 animate-in fade-in duration-500">
      {/* Top Row: Hero + Event Summary */}
      <div className="flex gap-5">
        {/* Main Hero Card */}
        <div
          className="flex-1 rounded-xl p-5 pb-8 relative overflow-hidden"
          style={{
            background: 'radial-gradient(59.96% 88.85% at 100% 99.92%, rgba(0, 133, 254, 0.1) 0%, rgba(0, 133, 254, 0) 100%), radial-gradient(111.15% 100% at 49.9% 0%, rgba(198, 225, 255, 0.08) 0%, rgba(198, 225, 255, 0.04) 100%)',
            backdropFilter: 'blur(25px)',
          }}
        >
          {/* Hero Image Area */}
          <div className="relative">
            <div className="h-48 w-full rounded-xl overflow-hidden relative">
              {artistImage ? (
                <img src={artistImage} alt={artistName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-4xl font-black text-white/20">{artistName.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#101624] to-transparent" />
            </div>

            {/* Team Logo */}
            <div className="absolute -bottom-12 left-4 w-24 h-24 rounded-full border-4 border-[#101624] overflow-hidden bg-yellow-300 shadow-xl">
              {artistImage ? (
                <img src={artistImage} alt={artistName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-400 text-black font-black text-xl">
                  {artistName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Event Title Row */}
          <div className="mt-16 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{eventTitle}</h1>
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                  style={{ background: 'radial-gradient(111.15% 100% at 49.9% 0%, rgba(198, 225, 255, 0.08) 0%, rgba(198, 225, 255, 0.04) 100%)' }}
                >
                  <div className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-rose-500' : 'bg-zinc-400'}`} />
                  <span className="text-white text-sm">{statusLabel}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  {isEventIdValid && (
                    <EditEventDialog
                      event={concert}
                      onSuccess={loadConcertData}
                      trigger={
                        <button
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.1) 2.64%, rgba(255, 255, 255, 0.05) 95.85%)' }}
                        >
                          <Edit2 className="w-5 h-5 text-gray-400" />
                        </button>
                      }
                    />
                  )}
                  {isEventIdValid && (
                    <ConfirmActionDialog
                      title={isCancelled ? 'Enable Event' : 'Disable Event'}
                      description={isCancelled ? 'This will mark the event as scheduled again.' : 'This will mark the event as cancelled.'}
                      confirmLabel={isCancelled ? 'Enable' : 'Disable'}
                      confirmVariant="default"
                      onConfirm={async () => {
                        try {
                          await updateEventStatus(isCancelled ? 'scheduled' : 'cancelled');
                          toast.success(isCancelled ? 'Event enabled' : 'Event disabled');
                          await loadConcertData();
                        } catch (error: any) {
                          toast.error(error?.message || 'Failed to update event');
                        }
                      }}
                      trigger={
                        <button
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.1) 2.64%, rgba(255, 255, 255, 0.05) 95.85%)' }}
                        >
                          <Ban className="w-5 h-5 text-gray-400" />
                        </button>
                      }
                    />
                  )}
                  {isEventIdValid && (
                    <ConfirmActionDialog
                      title="Delete Event"
                      description="This permanently deletes the event. This action cannot be undone."
                      confirmLabel="Delete"
                      confirmVariant="destructive"
                      onConfirm={async () => {
                        try {
                          await deleteEvent();
                          toast.success('Event deleted');
                          router.push('/concerts');
                        } catch (error: any) {
                          toast.error(error?.message || 'Failed to delete event');
                        }
                      }}
                      trigger={
                        <button
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.1) 2.64%, rgba(255, 255, 255, 0.05) 95.85%)' }}
                        >
                          <Trash2 className="w-5 h-5 text-gray-400" />
                        </button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm mt-6 leading-relaxed">
            {concert.description || concert.artist?.bio || 'No description available for this event.'}
          </p>

          {/* Event Details Row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div
              className="flex-1 min-w-[300px] rounded-lg p-4"
              style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.04) 2.64%, rgba(255, 255, 255, 0.02) 95.85%)' }}
            >
              <div className="space-y-3">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-white text-sm">
                    {eventDate ? format(eventDate, 'dd MMMM, yyyy') : 'Date TBD'}
                    {concert.time ? ` - ${concert.time}` : ''} (GMT-6 Central Time)
                  </span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <Tag className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-white text-sm">Sports, Baseball</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-white text-sm">
                    {concert.venue?.name ? `${concert.venue.name}${concert.venue.address ? `, ${concert.venue.address}` : ''}${concert.venue.city ? `, ${concert.venue.city}` : ''}` : 'Location TBD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy & Organizer Cards */}
            <div className="flex flex-col gap-3 min-w-[220px]">
              <div
                className="rounded-lg p-3"
                style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.04) 2.64%, rgba(255, 255, 255, 0.02) 95.85%)' }}
              >
                <p className="text-gray-400 text-xs mb-2">Policy</p>
                <p className="text-white text-sm font-medium">{artistName} Policy</p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.04) 2.64%, rgba(255, 255, 255, 0.02) 95.85%)' }}
              >
                <p className="text-gray-400 text-xs mb-2">Organizer</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-300 overflow-hidden">
                    {artistImage ? (
                      <img src={artistImage} alt={artistName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-black">
                        {artistName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-sm">{artistName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Summary Sidebar */}
        <div
          className="w-52 rounded-xl p-5 flex flex-col"
          style={{
            background: 'radial-gradient(68.68% 83.22% at 50% 100%, rgba(0, 133, 254, 0.2) 0%, rgba(0, 133, 254, 0) 100%), radial-gradient(111.15% 100% at 49.9% 0%, rgba(198, 225, 255, 0.08) 0%, rgba(198, 225, 255, 0.04) 100%)',
            backdropFilter: 'blur(25px)',
          }}
        >
          <h3 className="text-white font-semibold text-base mb-4">Event Summary</h3>

          <div className="flex-1 flex flex-col justify-between gap-3">
            {summaryStats.map((stat, idx) => (
              <div
                key={stat.label}
                className="rounded-lg p-4 flex flex-col items-center justify-center text-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.016) 0%, rgba(255, 255, 255, 0) 50%)',
                  filter: 'drop-shadow(0px 8px 24px rgba(8, 15, 23, 0.5))',
                }}
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-gray-400 text-xs mb-2">{stat.label}</p>
                <p className="text-white font-semibold text-base">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-5 mt-4 pt-3">
            <button
              onClick={() => setSummaryIndex(Math.max(0, summaryIndex - 1))}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === summaryIndex ? 'bg-white' : 'bg-gray-600'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setSummaryIndex(Math.min(2, summaryIndex + 1))}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Teams + Tags Row */}
      <div className="flex gap-3">
        {/* Teams Card */}
        <div
          className="w-80 rounded-xl p-5"
          style={{
            background: 'radial-gradient(59.96% 88.85% at 100% 99.92%, rgba(0, 133, 254, 0.1) 0%, rgba(0, 133, 254, 0) 100%), radial-gradient(111.15% 100% at 49.9% 0%, rgba(198, 225, 255, 0.08) 0%, rgba(198, 225, 255, 0.04) 100%)',
            backdropFilter: 'blur(25px)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-xs">Teams</p>
            <a href="/artists" className="text-gray-400 text-xs hover:text-white transition-colors">See all</a>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-300 overflow-hidden">
                {artistImage ? (
                  <img src={artistImage} alt={artistName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black">
                    {artistName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-white text-sm capitalize">{artistName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-100 overflow-hidden flex items-center justify-center">
                <span className="text-[10px] font-bold text-black">{venueName.substring(0, 2).toUpperCase()}</span>
              </div>
              <span className="text-white text-sm capitalize">{venueName}</span>
            </div>
          </div>
        </div>

        {/* Tags Card */}
        <div
          className="flex-1 rounded-xl p-5"
          style={{
            background: 'radial-gradient(59.96% 88.85% at 100% 99.92%, rgba(0, 133, 254, 0.1) 0%, rgba(0, 133, 254, 0) 100%), radial-gradient(111.15% 100% at 49.9% 0%, rgba(198, 225, 255, 0.08) 0%, rgba(198, 225, 255, 0.04) 100%)',
            backdropFilter: 'blur(25px)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-xs">Tags</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const colors = getTagColors(tag.name);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                    style={{ background: colors.bg }}
                  >
                    <span style={{ color: colors.text }}>{tag.name}</span>
                  </div>
                );
              })
            ) : (
              // Default tags for demo
              ['Fire Works (2)', 'High Spender', 'Music Lover', 'Loyal', 'VIP', 'Sports', 'Frequent Buyer', 'Phone Verified', 'Promo Code'].map((name) => {
                const colors = getTagColors(name.replace(/\s*\(\d+\)\s*/, ''));
                return (
                  <div
                    key={name}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                    style={{ background: colors.bg }}
                  >
                    <span className="text-white">{name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'radial-gradient(69.98% 541.77% at 100% 0%, rgba(35, 98, 201, 0.06) 0%, rgba(35, 98, 201, 0) 100%), radial-gradient(111.15% 100% at 49.9% 0%, rgba(198, 225, 255, 0.08) 0%, rgba(198, 225, 255, 0.04) 100%)',
          backdropFilter: 'blur(25px)',
        }}
      >
        <Tabs defaultValue="collections" className="w-full">
          <div
            className="px-6 py-1"
            style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.1) 2.64%, rgba(255, 255, 255, 0.05) 95.85%)' }}
          >
            <TabsList className="bg-transparent h-12 gap-0">
              <TabsTrigger
                value="collections"
                className="data-[state=active]:bg-white/10 data-[state=inactive]:bg-transparent text-white/60 data-[state=active]:text-white rounded-md px-6 py-2 text-sm font-medium"
              >
                Ticket Collections
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-white/10 data-[state=inactive]:bg-transparent text-white/60 data-[state=active]:text-white rounded-md px-6 py-2 text-sm font-medium"
              >
                Ticket Categories
              </TabsTrigger>
              <TabsTrigger
                value="attendees"
                className="data-[state=active]:bg-white/10 data-[state=inactive]:bg-transparent text-white/60 data-[state=active]:text-white rounded-md px-6 py-2 text-sm font-medium"
              >
                Attendee List
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="data-[state=active]:bg-white/10 data-[state=inactive]:bg-transparent text-white/60 data-[state=active]:text-white rounded-md px-6 py-2 text-sm font-medium"
              >
                Promotions / Discounts
              </TabsTrigger>
              <TabsTrigger
                value="seats"
                className="data-[state=active]:bg-white/10 data-[state=inactive]:bg-transparent text-white/60 data-[state=active]:text-white rounded-md px-6 py-2 text-sm font-medium"
              >
                Seat chart
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="collections" className="mt-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-semibold">Ticket Collection</p>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg"
                  style={{ background: 'linear-gradient(91.18deg, rgba(255, 255, 255, 0.1) 2.64%, rgba(255, 255, 255, 0.05) 95.85%)' }}
                >
                  <Expand className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ background: 'linear-gradient(91.18deg, rgba(0, 133, 254, 0.3) 2.64%, rgba(0, 133, 254, 0.3) 95.85%)' }}
                >
                  <Plus className="w-5 h-5" />
                  Attach Collection
                </button>
              </div>
            </div>

            <div className="h-[200px] flex flex-col items-center justify-center text-center bg-accent/5 border border-border/20 rounded-xl">
              <p className="text-sm font-medium text-white">No Ticket Collection Attached</p>
              <p className="text-xs text-gray-400 mt-2 max-w-md">
                Attach a ticket collection to enable publishing and sales for {eventTitle}.
              </p>
            </div>
          </TabsContent>

          {(['categories', 'attendees', 'promotions', 'seats'] as const).map((key) => (
            <TabsContent key={key} value={key} className="mt-0 p-6">
              <div className="h-[200px] flex flex-col items-center justify-center text-center bg-accent/5 border border-border/20 rounded-xl">
                <p className="text-sm font-medium text-white">No data available</p>
                <p className="text-xs text-gray-400 mt-2 max-w-md">
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
