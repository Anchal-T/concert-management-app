"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Plus, 
  Filter, 
  Upload, 
  Search, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trello
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
    const fetchDashboardData = async () => {
      setLoading(true);
      
      const { data: allConcerts } = await supabase
        .from('concerts')
        .select('*, artist:artists(name), venue:venues(name)')
        .order('date', { ascending: true });

      if (allConcerts) {
        setConcerts(allConcerts);
        const upcoming = allConcerts.filter(c => c.status === 'scheduled').length;
        const ongoing = allConcerts.filter(c => c.status === 'confirmed').length;
        const cancelled = allConcerts.filter(c => c.status === 'cancelled').length;
        
        setStats({
          total: allConcerts.length,
          upcoming,
          ongoing,
          cancelled
        });
      }
      
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Upcoming</Badge>;
      case 'confirmed':
      case 'ongoing':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Ongoing</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> {status}</Badge>;
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
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Event Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your concert operations in real-time.</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/50 p-1 rounded-xl">
          {['1D', '7D', '1M', '3M', 'Custom'].map((period) => (
            <Button 
              key={period} 
              variant={period === '7D' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={period === '7D' ? 'bg-background shadow-sm' : 'text-muted-foreground'}
            >
              {period}
            </Button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trello className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total events" 
          value={stats.total.toLocaleString()} 
          delta="+10%" 
          isUp={true} 
          icon={<Calendar className="w-5 h-5" />} 
          color="amber"
        />
        <StatCard 
          title="Upcoming events" 
          value={stats.upcoming.toLocaleString()} 
          delta="+12%" 
          isUp={true} 
          icon={<Clock className="w-5 h-5" />} 
          color="blue"
        />
        <StatCard 
          title="Ongoing events" 
          value={stats.ongoing.toLocaleString()} 
          delta="-12%" 
          isUp={false} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="emerald"
        />
        <StatCard 
          title="Cancelled events" 
          value={stats.cancelled.toLocaleString()} 
          delta="+5%" 
          isUp={true} 
          icon={<XCircle className="w-5 h-5" />} 
          color="rose"
        />
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Events ({concerts.length})</h2>
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by event, location"
                className="w-full bg-accent/30 border border-transparent focus:border-primary/20 rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl flex-1 md:flex-none">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground">
              <Upload className="w-4 h-4" />
            </Button>
            <Button className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex-1 md:flex-none">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-accent/30">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-semibold px-6 py-4">Event Name</TableHead>
                <TableHead className="font-semibold px-6 py-4">Date & Time</TableHead>
                <TableHead className="font-semibold px-6 py-4">Location</TableHead>
                <TableHead className="font-semibold px-6 py-4 text-right">Ticket Price</TableHead>
                <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                <TableHead className="font-semibold px-6 py-4 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concerts.length > 0 ? (
                concerts.map((concert) => (
                  <TableRow key={concert.id} className="group hover:bg-accent/20 border-border transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-xs text-primary ring-1 ring-border">
                          {concert.artist?.name?.charAt(0) || 'E'}
                        </div>
                        <span className="font-bold whitespace-nowrap">{concert.artist?.name} Live</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {format(new Date(concert.date), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {concert.venue?.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-medium text-foreground">
                      ${concert.ticket_price}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(concert.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-8 h-8 opacity-20" />
                      <p>No events found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled>&lt;</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg bg-primary text-primary-foreground border-primary hover:bg-primary/90">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg">2</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg">3</Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">&gt;</Button>
          </div>
          <p className="text-xs text-muted-foreground">Showing {concerts.length} total events</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, delta, isUp, icon, color }: { 
  title: string, 
  value: string | number, 
  delta: string, 
  isUp: boolean, 
  icon: React.ReactNode,
  color: 'amber' | 'blue' | 'emerald' | 'rose'
}) {
  const colorMap = {
    amber: 'text-amber-500 bg-amber-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
  };

  return (
    <Card className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl", colorMap[color])}>
            {icon}
          </div>
          <div className={cn(
            "flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border",
            isUp 
              ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" 
              : "text-rose-500 bg-rose-500/5 border-rose-500/10"
          )}>
            {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {delta}
            <span className="text-muted-foreground font-normal ml-1">from last week</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="text-3xl font-black tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
