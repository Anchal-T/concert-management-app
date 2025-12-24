"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Tags,
  Settings,
  HelpCircle,
  Music2,
  MapPin,
  Trello,
  LogOut,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Trello },
  { name: 'Events', href: '/concerts', icon: Calendar },
  { name: 'Artists', href: '/artists', icon: Users },
  { name: 'Venues', href: '/venues', icon: MapPin },
  { name: 'Tags', href: '/tags', icon: Tags },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#04070D] z-50 flex flex-col border-r border-border/10">
      <div className="h-24 flex items-center px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Music2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground">
            Orchids
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between py-8 px-4">
        <div className="space-y-8">
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Main Menu</p>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <item.icon className={cn("w-5 h-5 transition-colors duration-300", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Support</p>
            <nav className="space-y-1.5">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-colors duration-300", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="px-4">
          <button
            onClick={() => toast.info('Logout functionality requires authentication setup')}
            className="w-full group flex items-center gap-3.5 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
