"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Upload, 
  MoreHorizontal, 
  Loader2,
  ChevronRight,
  Calendar,
  MapPin,
  Ticket,
  Clock
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
import { ScheduleConcertDialog } from '@/components/ScheduleConcertDialog';
import Link from 'next/link';

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('concerts')
        .select('*, artist:artists(name), venue:venues(name, city)')
        .order('date', { ascending: true });

      if (data) {
        setConcerts(data);
      }
      setLoading(false);
    };

    fetchConcerts();
  }, []);

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

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Event Management</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-foreground font-bold">Events</span>
        </div>
      </div>

      <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold">All Events ({concerts.length})</h2>
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by event, location"
                className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="rounded-lg h-10 px-4 text-sm font-medium bg-accent/20 border-transparent hover:bg-accent/40">
              Filter <Filter className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 bg-accent/20 border-transparent hover:bg-accent/40">
              <Upload className="w-4 h-4" />
            </Button>
            <ScheduleConcertDialog />
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
              {concerts.length > 0 ? (
                concerts.map((concert) => (
                  <TableRow key={concert.id} className="group hover:bg-accent/10 border-border/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <Link href={`/concerts/${concert.id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/40 flex items-center justify-center text-primary font-bold text-xs">
                          {concert.artist?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">{concert.artist?.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Live Performance</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{format(new Date(concert.date), 'dd MMM, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{concert.time || '19:00'} (GMT-6)</span>
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
                        <span className="text-sm font-bold">1,240</span>
                        <span className="text-[10px] text-muted-foreground">/ 2,000</span>
                      </div>
                      <div className="w-24 h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-primary w-[62%]" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(concert.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent/40">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
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
          <p className="text-xs text-muted-foreground">Showing 1-{concerts.length} of {concerts.length} events</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="rounded-lg h-8 px-3 text-xs bg-accent/10 border-transparent">Previous</Button>
            <Button variant="outline" size="sm" disabled className="rounded-lg h-8 px-3 text-xs bg-accent/10 border-transparent">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

