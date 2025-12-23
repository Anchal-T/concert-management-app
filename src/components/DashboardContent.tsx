"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  XCircle,
  Plus,
  Filter,
  Upload,
  Search,
  MoreHorizontal,
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

// Renders the dashboard overview and events table by loading event data from the API and presenting summary metrics.
export default function DashboardContent() {
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    cancelled: 0
  });
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches dashboard data and derives summary stats; kept here to run once on mount.
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const allConcerts = await res.json();
          setConcerts(allConcerts);

          const upcoming = allConcerts.filter(
            (c: any) =>
              c.status?.toLowerCase() === 'upcoming' || c.status?.toLowerCase() === 'scheduled'
          ).length;
          const ongoing = allConcerts.filter(
            (c: any) =>
              c.status?.toLowerCase() === 'ongoing' || c.status?.toLowerCase() === 'confirmed'
          ).length;
          const cancelled = allConcerts.filter((c: any) => c.status?.toLowerCase() === 'cancelled')
            .length;

          setStats({
            total: allConcerts.length,
            upcoming,
            ongoing,
            cancelled
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Section: Event Summary & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Event Card */}
        <div className="lg:col-span-9 bg-card/40 border border-border/50 rounded-3xl overflow-hidden relative group">
          <div className="h-48 w-full relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=2000" 
              alt="Event Cover" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#04070D] to-transparent" />
          </div>
          
          <div className="p-8 -mt-20 relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-[#04070D] overflow-hidden bg-accent shadow-2xl">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gastonia" 
                    alt="Team Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Gastonia Ghost Peppers vs. Charleston Dirty Birds</h1>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Draft
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-2xl line-clamp-2">
                    The Gastonia Ghost Peppers are a professional baseball team based in Gastonia, NC, bringing exciting games and a passionate fan experience to the local community.
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
                  <p className="text-sm font-bold">26 July, 2025 - 30 July, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Tags</p>
                  <p className="text-sm font-bold">Sports, Baseball</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-bold">First Horizon Park, Nashville, TN</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-accent/10 rounded-2xl p-4 border border-border/30 flex items-center justify-between group/item hover:bg-accent/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                    <Info className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Policy</p>
                    <p className="text-sm font-bold">Gastonia Ghost Peppers Policy</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-all" />
              </div>
              <div className="bg-accent/10 rounded-2xl p-4 border border-border/30 flex items-center justify-between group/item hover:bg-accent/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gastonia" alt="Organizer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Organizer</p>
                    <p className="text-sm font-bold">Gastonia Ghost Peppers</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-3xl p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Event Summary</h3>
            
            <div className="flex-1 space-y-10">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Tickets Sold</p>
                <p className="text-3xl font-black tracking-tight">2,000</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-black tracking-tight">$87,120</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users2 className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Unique Attendees</p>
                <p className="text-3xl font-black tracking-tight">1,398</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border/50 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-border" />
              <div className="w-2 h-2 rounded-full bg-border" />
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
            <h2 className="text-xl font-black tracking-tight">Events ({concerts.length.toLocaleString()})</h2>
            <div className="relative group min-w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by event, location"
                className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl h-11 px-5 text-sm font-bold bg-accent/20 border-transparent hover:bg-accent/40 transition-all">
              Filter <Filter className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 bg-accent/20 border-transparent hover:bg-accent/40 transition-all">
              <Upload className="w-4 h-4" />
            </Button>
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
                <TableHead className="font-bold text-muted-foreground px-8 py-4 w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concerts.length > 0 ? (
                concerts.map((concert) => (
                  <TableRow key={concert.id} className="group hover:bg-accent/10 border-border/50 transition-colors">
                    <TableCell className="px-8 py-5">
                      <Link href={`/concerts/${concert.id}`} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${concert.artist?.name}`}
                            alt={concert.artist?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{concert.artist?.name} Vs Nashville Sounds</span>
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
                    <TableCell className="px-8 py-5">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
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

        <div className="p-8 flex items-center justify-between border-t border-border/50">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Showing 1-10 of {concerts.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-accent/20 border-transparent hover:bg-accent/40 transition-all" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-10 w-10 rounded-xl text-xs font-bold transition-all",
                    page === 1 ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-accent/20 border-transparent hover:bg-accent/40 text-muted-foreground"
                  )}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-accent/20 border-transparent hover:bg-accent/40 transition-all">
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Combines className inputs into a single string; this avoids repetitive conditional join logic in JSX.
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}