"use client";

import { Search, Bell, User, Settings, Command } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function TopBar() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const segment = pathname.split('/')[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search for anything..."
            className="w-full bg-accent/50 border border-transparent focus:border-primary/30 focus:bg-accent/80 transition-all rounded-full py-2 pl-10 pr-12 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-border rounded px-1.5 py-0.5 bg-background text-[10px] font-medium text-muted-foreground">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive border-2 border-background rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-none">Hailey Carter</p>
            <p className="text-[11px] text-muted-foreground mt-1">Master Admin</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-border group overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
