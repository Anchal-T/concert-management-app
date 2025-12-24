"use client";

import { useEffect, useState } from 'react';
import { Search, Bell, User, Settings, Command, Loader2, Calendar } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

type TimeRangeKey = '1D' | '7D' | '1M' | '3M' | 'CUSTOM';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState<number | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    // Loads the current user for the top-right profile block.
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/current');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Derives a small notification count from existing live data (upcoming/scheduled events).
    const controller = new AbortController();

    const fetchNotificationCount = async () => {
      try {
        const res = await fetch('/api/events', { signal: controller.signal });
        if (!res.ok) return;
        const events = (await res.json()) as Array<{ status?: string }>;
        const upcomingEvents = events.filter((event: any) => {
          const status = (event.status ?? '').toLowerCase();
          return status === 'scheduled' || status === 'upcoming' || status === 'confirmed';
        });
        setUpcomingEvents(upcomingEvents.slice(0, 5)); // Keep only top 5
        setNotificationCount(upcomingEvents.length);
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Failed to fetch notification count:', error);
        }
      }
    };

    fetchNotificationCount();
    return () => controller.abort();
  }, []);

  // Handle global search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/concerts?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // Maps the current pathname to the title shown in the breadcrumb.
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/concerts') return 'Events';
    if (pathname.startsWith('/concerts/')) return 'Event Details';

    const segment = pathname.split('/')[1] ?? '';
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard';
  };

  // Builds the breadcrumb segments to match the Figma header.
  const getBreadcrumbSegments = (): string[] => {
    if (pathname === '/concerts') return ['Event Management', 'Events'];
    if (pathname.startsWith('/concerts/')) return ['Event Management', 'Events', 'Event Details'];
    return ['Event Management', getPageTitle()];
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'admin': 'Master Admin',
      'manager': 'Event Manager',
      'user': 'Team Member',
    };
    return roleLabels[role] || 'User';
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-20 border-b border-border/50 bg-[#04070D]/80 backdrop-blur-md z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-2 text-sm font-medium">
          {getBreadcrumbSegments().map((segment, index, all) => {
            const isLast = index === all.length - 1;
            return (
              <div key={`${segment}-${index}`} className="flex items-center gap-2">
                <span className={isLast ? 'text-foreground font-bold' : 'text-muted-foreground'}>{segment}</span>
                {!isLast && <span className="text-muted-foreground">/</span>}
              </div>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl px-8">
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search events... (press Enter)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-accent/20 border border-transparent focus:border-primary/20 focus:bg-accent/30 transition-all rounded-xl py-2.5 pl-12 pr-12 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-accent/50 text-[10px] text-muted-foreground font-bold">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </form>

      <div className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              {typeof notificationCount === 'number' && notificationCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-primary text-primary-foreground rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#04070D]">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#0B101B] border-border/50 p-2">
            <div className="px-3 py-2">
              <h3 className="font-bold text-sm">Upcoming Events</h3>
              <p className="text-xs text-muted-foreground">{notificationCount || 0} events scheduled</p>
            </div>
            <DropdownMenuSeparator className="bg-border/50" />
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <DropdownMenuItem key={event.id} asChild>
                  <Link href={`/concerts/${event.id}`} className="flex items-center gap-3 py-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.artist?.name || 'Event'}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No upcoming events
              </div>
            )}
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild>
              <Link href="/concerts" className="flex items-center justify-center py-2 text-sm font-medium text-primary cursor-pointer">
                View all events
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/settings" className="flex items-center gap-3 pl-2 group">
          <div className="text-right hidden sm:block">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : user ? (
              <>
                <p className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">{user.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{getRoleLabel(user.role)}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-foreground leading-none">Guest User</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Not logged in</p>
              </>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-border overflow-hidden shadow-lg">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}

