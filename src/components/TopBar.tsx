"use client";

import { useEffect, useState } from 'react';
import { Search, Bell, User, Settings, Command, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
}

export function TopBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const segment = pathname.split('/')[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
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
          <span className="text-muted-foreground">Event Management</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-bold">{getPageTitle()}</span>
        </nav>
      </div>

      <div className="flex-1 max-w-xl px-8">
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search for anything..."
            className="w-full bg-accent/20 border border-transparent focus:border-primary/20 focus:bg-accent/30 transition-all rounded-xl py-2.5 pl-12 pr-12 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-accent/50 text-[10px] text-muted-foreground font-bold">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#04070D]"></span>
        </button>

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

