"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Calendar, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Artists', href: '/artists', icon: Users },
  { name: 'Venues', href: '/venues', icon: MapPin },
  { name: 'Concerts', href: '/concerts', icon: Calendar },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold tracking-tighter text-black dark:text-white">
                CONCERT<span className="text-zinc-500 underline decoration-zinc-300">HUB</span>
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200",
                      isActive
                        ? "border-black text-black dark:border-white dark:text-white"
                        : "border-transparent text-zinc-500 hover:text-black hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-white dark:hover:border-zinc-700"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
