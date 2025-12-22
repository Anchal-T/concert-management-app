"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ArtistsList() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch artists');
    } else {
      setArtists(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from('artists').delete().eq('id', id);

    if (error) {
      toast.error(`Failed to delete ${name}`);
    } else {
      toast.success(`${name} removed from roster`);
      fetchArtists();
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

  if (artists.length === 0) {
    return (
      <div className="text-center py-32 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">No artists found</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          Start by adding a new artist to your professional roster.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {artists.map((artist) => (
        <Card key={artist.id} className="overflow-hidden bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group rounded-2xl">
          <div className="aspect-square relative overflow-hidden bg-accent/20">
            {artist.image_url ? (
              <img
                src={artist.image_url}
                alt={artist.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20">
                <Music className="w-12 h-12 text-primary/20" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                  <DropdownMenuItem className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Artist
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={() => handleDelete(artist.id, artist.name)}
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                {artist.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent text-[10px] px-2 py-0">
                  {artist.genre || 'Artist'}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">4.9</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1">
                View Profile <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
