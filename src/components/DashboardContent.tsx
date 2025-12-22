"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Calendar, DollarSign, ArrowUpRight, Music, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardContent() {
  const [stats, setStats] = useState({
    artists: 0,
    venues: 0,
    concerts: 0,
    revenue: 0
  });
  const [recentConcerts, setRecentConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const [artistsCount, venuesCount, concertsCount, recentConcertsRes] = await Promise.all([
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('venues').select('*', { count: 'exact', head: true }),
        supabase.from('concerts').select('*', { count: 'exact', head: true }),
        supabase.from('concerts')
          .select('*, artist:artists(name), venue:venues(name)')
          .order('date', { ascending: true })
          .limit(3)
      ]);

      const { data: revenueData } = await supabase.from('concerts').select('ticket_price');
      const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.ticket_price || 0), 0) || 0;

      setStats({
        artists: artistsCount.count || 0,
        venues: venuesCount.count || 0,
        concerts: concertsCount.count || 0,
        revenue: totalRevenue
      });
      setRecentConcerts(recentConcertsRes.data || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-1">Welcome back. Here's what's happening with your concerts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Artists</CardTitle>
            <Users className="w-4 h-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.artists}</div>
            <p className="text-xs text-zinc-400 mt-1">Performers in roster</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500">Venues</CardTitle>
            <MapPin className="w-4 h-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.venues}</div>
            <p className="text-xs text-zinc-400 mt-1">Partner locations</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500">Upcoming Concerts</CardTitle>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concerts}</div>
            <p className="text-xs text-zinc-400 mt-1">Scheduled events</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500">Est. Booking Value</CardTitle>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-zinc-400 mt-1">Based on base prices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>Your next 3 scheduled events</CardDescription>
              </div>
              <Link href="/concerts">
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConcerts.length > 0 ? (
                recentConcerts.map((concert) => (
                  <div key={concert.id} className="flex items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center mr-4">
                      <Music className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black dark:text-white truncate">{concert.artist?.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{concert.venue?.name} • {format(new Date(concert.date), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tighter">
                        {concert.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-500 text-sm">No upcoming concerts.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcut to common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/artists">
              <Button variant="outline" className="w-full justify-start h-20 flex-col items-start p-4 hover:border-black dark:hover:border-white transition-all">
                <Users className="w-5 h-5 mb-2 text-zinc-400" />
                <span>Add Artist</span>
              </Button>
            </Link>
            <Link href="/venues">
              <Button variant="outline" className="w-full justify-start h-20 flex-col items-start p-4 hover:border-black dark:hover:border-white transition-all">
                <MapPin className="w-5 h-5 mb-2 text-zinc-400" />
                <span>New Venue</span>
              </Button>
            </Link>
            <Link href="/concerts">
              <Button variant="outline" className="w-full justify-start h-20 flex-col items-start p-4 hover:border-black dark:hover:border-white transition-all">
                <Plus className="w-5 h-5 mb-2 text-zinc-400" />
                <span>Schedule Event</span>
              </Button>
            </Link>
            <Button variant="outline" disabled className="w-full justify-start h-20 flex-col items-start p-4 opacity-50 grayscale">
              <DollarSign className="w-5 h-5 mb-2 text-zinc-400" />
              <span>Ticketing (Soon)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
