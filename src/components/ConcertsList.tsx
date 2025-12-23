"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

export function ConcertsList() {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConcerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('concerts')
      .select(`
        *,
        artist:artists(name, genre, image_url),
        venue:venues(name, city, state)
      `)
      .order('date', { ascending: true });

    if (error) {
      toast.error('Failed to fetch concerts');
    } else {
      setConcerts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { error } = await supabase.from('concerts').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete concert');
    } else {
      toast.success('Concert registration cancelled');
      fetchConcerts();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Scheduled</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Draft</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">{status}</Badge>;
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

  if (concerts.length === 0) {
    return (
      <div className="text-center py-32 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">No concerts scheduled</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          Create your first professional event to begin managing tickets and artists.
        </p>
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
                  {concert.artist?.image_url ? (
                    <img src={concert.artist.image_url} alt={concert.artist.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
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
                          {concert.ticket_price ? `$${concert.ticket_price}` : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center text-sm font-semibold text-foreground">
                        <Calendar className="w-4 h-4 mr-2.5 text-primary" />
                        {format(new Date(concert.date), 'PPPP')}
                      </div>
                      <div className="flex items-center text-sm font-semibold text-foreground">
                        <Clock className="w-4 h-4 mr-2.5 text-primary" />
                        {concert.time || '19:00'}
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
