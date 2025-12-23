"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Trash2,
  Edit2,
  Loader2,
  Music,
  MoreVertical,
  Star,
  ExternalLink,
  Plus,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddArtistDialog } from './AddArtistDialog';

export function ArtistsList() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artists');
      if (!res.ok) throw new Error('Failed to fetch artists');
      const data = await res.json();
      setArtists(data || []);
    } catch (error) {
      toast.error('Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/artists/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success(`${name} removed from roster`);
      fetchArtists();
    } catch (error) {
      toast.error(`Failed to delete ${name}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Artists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-black tracking-tight">Artists ({artists.length})</h2>
          <div className="relative group min-w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search artists by name, genre..."
              className="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl h-11 px-5 text-sm font-bold bg-accent/20 border-transparent hover:bg-accent/40 transition-all">
            Filter <Filter className="w-4 h-4 ml-2" />
          </Button>
          <AddArtistDialog />
        </div>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-32 bg-card/40 rounded-3xl border border-dashed border-border/50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-accent/20 flex items-center justify-center mb-6">
            <Music className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No artists found</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Start by adding a new artist to your professional roster.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="group bg-card/40 border border-border/50 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={artist.imageUrl || artist.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.name}`}
                  alt={artist.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04070D] via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/40 text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl bg-[#0B101B] border-border/50">
                      <DropdownMenuItem className="gap-2 py-2.5 cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 py-2.5 cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary">
                        <ExternalLink className="w-4 h-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 py-2.5 cursor-pointer rounded-lg text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                        onClick={() => handleDelete(artist.id, artist.name)}
                      >
                        <Trash2 className="w-4 h-4" /> Remove Artist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {artist.genre || 'Artist'}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-current" /> 4.9
                    </div>
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-white mb-1 group-hover:text-primary transition-colors">{artist.name}</h3>
                  <p className="text-white/60 text-xs font-medium line-clamp-1">Nashville, TN • 12 Upcoming Events</p>
                </div>
              </div>
              
              <div className="p-6 flex items-center justify-between border-t border-border/10">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#04070D] bg-accent overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.name}${i}`} alt="Fan" />
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-[#04070D] bg-accent/50 flex items-center justify-center text-[8px] font-bold text-white">
                    +2k
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-transparent p-0 h-auto group/btn">
                  View Schedule <ArrowUpRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
