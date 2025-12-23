"use client";

import { useEffect, useState } from 'react';
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
  Trello,
  Settings
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
      
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const allConcerts = await res.json();
          setConcerts(allConcerts);
          
          const upcoming = allConcerts.filter((c: any) => c.status?.toLowerCase() === 'upcoming' || c.status?.toLowerCase() === 'scheduled').length;
          const ongoing = allConcerts.filter((c: any) => c.status?.toLowerCase() === 'ongoing' || c.status?.toLowerCase() === 'confirmed').length;
          const cancelled = allConcerts.filter((c: any) => c.status?.toLowerCase() === 'cancelled').length;
          
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

  const getStatusBadge = (status: string) => {
    if (!status) return null;
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
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Event Overview</h1>
        </div>
        <div className="flex items-center gap-2 bg-accent/30 p-1 rounded-lg">
          {['1D', '7D', '1M', '3M', 'Custom'].map((period) => (
            <Button 
              key={period} 
              variant={period === '7D' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn(
                "h-8 px-3 text-xs font-medium rounded-md transition-all",
                period === '7D' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {period}
            </Button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total events" 
          value={stats.total.toLocaleString()} 
          delta="10%" 
          isUp={true} 
          icon={<div className="w-2 h-2 rounded-full bg-amber-500" />} 
          color="amber"
        />
        <StatCard 
          title="Upcoming events" 
          value={stats.upcoming.toLocaleString()} 
          delta="12%" 
          isUp={true} 
          icon={<div className="w-2 h-2 rounded-full bg-blue-500" />} 
          color="blue"
        />
        <StatCard 
          title="Ongoing events" 
          value={stats.ongoing.toLocaleString()} 
          delta="12%" 
          isUp={false} 
          icon={<div className="w-2 h-2 rounded-full bg-emerald-500" />} 
          color="emerald"
        />
        <StatCard 
          title="Cancelled events" 
          value={stats.cancelled.toLocaleString()} 
          delta="5%" 
          isUp={false} 
          icon={<div className="w-2 h-2 rounded-full bg-rose-500" />} 
          color="rose"
        />
      </div>

      <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold">Events ({concerts.length})</h2>
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
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${concert.artist?.name}`} 
                            alt={concert.artist?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{concert.artist?.name} Vs Nashville...</span>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(concert.date), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {concert.venue?.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 5000).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(concert.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-accent/20 border-transparent hover:bg-accent/40" disabled>&lt;</Button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button 
                  key={page}
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-medium transition-all",
                    page === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-accent/20 border-transparent hover:bg-accent/40 text-muted-foreground"
                  )}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-accent/20 border-transparent hover:bg-accent/40">&gt;</Button>
          </div>
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
  return (
    <Card className="bg-card/40 border-border/50 overflow-hidden group hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent/30">
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        <div className="space-y-3">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <div className={cn(
            "flex items-center text-xs font-medium",
            isUp ? "text-emerald-500" : "text-rose-500"
          )}>
            {isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {delta}
            <span className="text-muted-foreground font-normal ml-1.5">From last week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}