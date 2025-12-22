"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Tags, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Music2,
  MapPin
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Events', href: '/concerts', icon: Calendar },
  { name: 'Artists', href: '/artists', icon: Users },
  { name: 'Venues', href: '/venues', icon: MapPin },
  { name: 'Tags', href: '#', icon: Tags },
];

const secondaryNavigation = [
  { name: 'Settings', href: '#', icon: Settings },
  { name: 'Help', href: '#', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#04070D] z-50 flex flex-col border-r border-border/50">
      <div className="h-20 flex items-center px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Music2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">
            Orchids
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between py-8 px-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all duration-200"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              <span className="font-bold text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
