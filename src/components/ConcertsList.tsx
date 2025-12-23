"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Loader2,
  Music,
  ChevronRight,
  MonitorPlay,
  Ticket,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import { ScheduleConcertDialog } from './ScheduleConcertDialog';

export function ConcertsList() {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConcerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch concerts');
      const data = await res.json();
      setConcerts(data || []);
    } catch (error) {
      toast.error('Failed to fetch concerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Concert registration cancelled');
      fetchConcerts();
    } catch (error) {
      toast.error('Failed to delete concert');
    }
  };

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
      default:
        return <div className="flex items-center gap-2 text-zinc-500 bg-zinc-500/10 px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-500/20"><div className="w-1 h-1 rounded-full bg-zinc-500" /> {status}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Retrieving Schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-black tracking-tight">Events ({concerts.length})</h2>
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
          <ScheduleConcertDialog />
        </div>
      </div>

      {concerts.length === 0 ? (
        <div className="text-center py-32 bg-card/40 rounded-3xl border border-dashed border-border/50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-accent/20 flex items-center justify-center mb-6">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No concerts scheduled</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Create your first professional event to begin managing tickets and artists.
          </p>
        </div>
      ) : (
        <div className="bg-card/40 border border-border/50 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Event Name</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Date & Time</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Location</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Tickets Sold</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 text-[10px] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground px-8 py-4 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concerts.map((concert) => (
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
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                          onClick={(e) => handleDelete(concert.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

  return (
    <div className="grid grid-cols-1 gap-6">
      {concerts.map((concert) => (
        <Link key={concert.id} href={`/concerts/${concert.id}`}>
          <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-3xl">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Visual Area */}
                <div className="w-full lg:w-72 h-48 lg:h-auto relative overflow-hidden bg-accent">
                  {concert.artist?.imageUrl || concert.artist?.image_url ? (
                    <img 
                      src={concert.artist?.imageUrl || concert.artist?.image_url} 
                      alt={concert.artist.name} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-accent">
                      <Music className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    {getStatusBadge(concert.status)}
                  </div>
                  <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent lg:hidden" />
                </div>
                
                {/* Content Area */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-[0.2em] mb-2">
                        <MonitorPlay className="w-3 h-3" />
                        Live Event
                      </div>
                      <h3 className="text-3xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {concert.artist?.name}
                      </h3>
                      <p className="text-muted-foreground flex items-center font-medium">
                        <MapPin className="w-4 h-4 mr-1.5 text-primary/50" />
                        {concert.venue?.name}, {concert.venue?.city}
                      </p>
                    </div>
                    
                    <div className="bg-accent/30 rounded-2xl p-4 border border-border sm:text-right min-w-[140px]">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Entry Price</p>
                      <div className="flex items-center sm:justify-end gap-1.5">
                        <Ticket className="w-4 h-4 text-emerald-500" />
                        <span className="text-2xl font-black text-foreground">
                          {concert.price ? `$${concert.price}` : (concert.ticket_price ? `$${concert.ticket_price}` : 'TBD')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center text-sm font-semibold text-foreground">
                        <Calendar className="w-4 h-4 mr-2.5 text-primary" />
                        {concert.date && !isNaN(new Date(concert.date).getTime()) ? format(new Date(concert.date), 'PPPP') : 'Date TBD'}
                      </div>
                      <div className="flex items-center text-sm font-semibold text-foreground">
                        <Clock className="w-4 h-4 mr-2.5 text-primary" />
                         {/* Extract time from date or use dummy */}
                         {concert.date && !isNaN(new Date(concert.date).getTime()) ? format(new Date(concert.date), 'h:mm a') : '19:00'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                        onClick={(e) => handleDelete(concert.id, e)}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                      <Button variant="outline" className="rounded-xl font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        Manage Event <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
