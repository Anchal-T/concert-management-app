"use client";

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  LayoutGrid,
  Music,
  Ticket,
  DollarSign,
  ChevronRight,
  Edit2,
  Trash2,
  Share2,
  Info,
  ShieldCheck,
  User,
  Users,
  Tags,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
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
        <Link href="/concerts">
          <Button variant="link" className="mt-4">Back to Schedule</Button>
        </Link>
      </div>
    );
  }

  // Normalize data for display
  const artistImage = concert.artist?.imageUrl || concert.artist?.image_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";
  const artistName = concert.artist?.name || 'Artist';
  const venueName = concert.venue?.name || 'Venue TBD';
  const price = concert.price ?? concert.ticket_price ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link href="/concerts" className="hover:text-primary transition-colors">Concert Management</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <Link href="/concerts" className="hover:text-primary transition-colors">Events</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="text-foreground font-bold">Event Details</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-9">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button size="sm" className="rounded-xl h-9 bg-primary shadow-lg shadow-primary/20">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content (Left 3 cols) */}
        <div className="xl:col-span-3 space-y-8">
          <Card className="overflow-hidden bg-[#0B101B] border-border rounded-[32px] border-2">
            <div className="relative aspect-[21/9] w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B101B] via-transparent to-transparent z-10" />
              <img
                src={artistImage}
                className="w-full h-full object-cover"
                alt="Event Header"
              />
              <div className="absolute -bottom-8 left-8 z-20">
                <div className="w-32 h-32 rounded-full border-4 border-[#0B101B] bg-accent p-1 overflow-hidden shadow-2xl">
                  <img
                    src={artistImage}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            <CardContent className="pt-12 pb-8 px-10">
              <div className="flex justify-between items-start gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                      {artistName} <span className="text-muted-foreground/30 mx-2">vs.</span> {venueName}
                    </h1>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 capitalize font-bold px-3 py-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      {concert.status}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground leading-relaxed max-w-3xl">
                    {concert.artist?.bio || "Join us for an unforgettable night of performance. This event brings together world-class talent and state-of-the-art venue facilities for a premium fan experience."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground group">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-primary/50">Schedule</p>
                          <p className="text-foreground font-bold">{concert.date ? format(new Date(concert.date), 'dd MMMM, yyyy') : 'TBD'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground group">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-primary/50">Category</p>
                          <p className="text-foreground font-bold text-sm">{concert.artist?.genre || 'Live Concert'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground group">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-primary/50">Location</p>
                          <p className="text-foreground font-bold text-sm">{venueName}, {concert.venue?.city}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-accent/30 border border-border flex flex-col gap-3 group">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Policy</p>
                          <Info className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                        <div className="bg-background rounded-xl p-3 text-sm font-semibold flex items-center gap-2 group-hover:border-primary/30 transition-all border border-transparent">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          Premium Entry Protocol
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-accent/30 border border-border flex flex-col gap-3 group">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Organizer</p>
                          <User className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                        <div className="bg-background rounded-xl p-3 text-sm font-semibold flex items-center gap-3 group-hover:border-primary/30 transition-all border border-transparent">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            <Music className="w-4 h-4" />
                          </div>
                          ConcertHub Elite
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground">
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams / Multi-artist support UI placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#0B101B]/50 border-border rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Featured Artists</h3>
                <Button variant="link" size="sm" className="text-primary p-0 h-auto font-bold">See all</Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B101B]/80 border border-border group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent overflow-hidden">
                      <img src={artistImage} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold">{artistName}</span>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Headliner</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B101B]/40 border border-border/50 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-bold">Opening Act</span>
                  </div>
                  <Badge variant="outline" className="border-border text-muted-foreground">Pending</Badge>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0B101B]/50 border-border rounded-3xl p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Tags className="w-5 h-5 text-primary" /> Event Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? tags.map(tag => (
                  <Badge
                    key={tag.id}
                    className="hover:bg-primary hover:text-white transition-all cursor-default px-3 py-1.5 rounded-xl border-border"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}
                  >
                    {tag.name}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground">No tags assigned. <Link href="/tags" className="text-primary hover:underline">Manage tags</Link></p>
                )}
              </div>
            </Card>
          </div>

          {/* Bottom Tabs Section */}
          <div className="bg-[#0B101B] border-2 border-border rounded-[32px] overflow-hidden">
            <Tabs defaultValue="tickets" className="w-full">
              <div className="bg-accent/30 px-8 py-2 border-b border-border">
                <TabsList className="bg-transparent h-14 gap-8">
                  <TabsTrigger value="tickets" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-sm px-0 transition-all border-b-2 border-transparent">
                    Ticket Collections
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-sm px-0 transition-all border-b-2 border-transparent">
                    Ticket Categories
                  </TabsTrigger>
                  <TabsTrigger value="attendees" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-sm px-0 transition-all border-b-2 border-transparent">
                    Attendee List
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="tickets" className="mt-0 p-12 min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-accent/50 flex items-center justify-center mb-6 border border-border ring-4 ring-accent/20">
                  <Ticket className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h4 className="text-xl font-bold mb-2">No Ticket Collection Attached</h4>
                <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                  Attach a ticket collection to enable publishing and sales for the {artistName} event.
                </p>
                <Button className="rounded-2xl bg-primary px-8 h-12 shadow-xl shadow-primary/20">
                  <Plus className="w-5 h-5 mr-2" /> Attach Collection
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar Summary (Right 1 col) */}
        <div className="space-y-8">
          <Card className="bg-[#0B101B] border-border rounded-[32px] overflow-hidden sticky top-32 group hover:border-primary/20 transition-all border-2">
            <div className="p-8 space-y-8 text-center sm:text-left">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Event Summary</h3>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-accent/20 border border-border group-hover:bg-accent/30 transition-all">
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tickets Sold</p>
                  </div>
                  <div className="text-4xl font-black">{(concert.soldTickets || stats.totalSold || 0).toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">Target: {(concert.totalTickets || 0).toLocaleString()}</p>
                </div>

                <div className="p-6 rounded-3xl bg-accent/20 border border-border group-hover:bg-accent/30 transition-all">
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                  </div>
                  <div className="text-4xl font-black">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">@ ${Number(price).toFixed(2)} per ticket</p>
                </div>

                <div className="p-6 rounded-3xl bg-accent/20 border border-border group-hover:bg-accent/30 transition-all">
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unique Fans</p>
                  </div>
                  <div className="text-4xl font-black">{stats.uniqueBuyers.toLocaleString()}</div>
                  <div className="flex items-center justify-center sm:justify-start -space-x-2 mt-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0B101B] bg-accent flex items-center justify-center text-[8px] font-black">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    {stats.uniqueBuyers > 4 && (
                      <div className="w-7 h-7 rounded-full border-2 border-[#0B101B] bg-primary flex items-center justify-center text-[8px] font-black">+{(stats.uniqueBuyers - 4).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-[#0B101B]/40 border-border rounded-3xl border-2 p-6 border-dashed">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Additional Intelligence</p>
                <p className="text-xs text-muted-foreground mt-1 px-4">Connect demographic data or marketing pixels to see enhanced stats.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl font-bold mt-2">
                Upgrade Plan
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
