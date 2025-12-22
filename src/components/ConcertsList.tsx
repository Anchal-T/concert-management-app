"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, DollarSign, Trash2, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this concert?')) return;

    const { error } = await supabase.from('concerts').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete concert');
    } else {
      toast.success('Concert deleted');
      fetchConcerts();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'draft': return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (concerts.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <Calendar className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
        <h3 className="text-lg font-medium text-black dark:text-white">No concerts scheduled</h3>
        <p className="text-zinc-500 mt-1">Schedule your first event to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {concerts.map((concert) => (
        <Card key={concert.id} className="overflow-hidden hover:border-zinc-400 transition-colors duration-200">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-32 md:h-auto bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                {concert.artist?.image_url ? (
                  <img src={concert.artist.image_url} alt={concert.artist.name} className="object-cover w-full h-full" />
                ) : (
                  <Music className="w-8 h-8 text-zinc-300" />
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className={getStatusColor(concert.status)}>
                    {concert.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-black dark:text-white">{concert.artist?.name}</h3>
                    <p className="text-zinc-500 text-sm font-medium flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {concert.venue?.name}, {concert.venue?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black dark:text-white">
                      {concert.ticket_price ? `$${concert.ticket_price}` : 'TBD'}
                    </p>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Ticket Price</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(concert.date), 'PPPP')}
                  </div>
                  {concert.time && (
                    <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {concert.time}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => handleDelete(concert.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
