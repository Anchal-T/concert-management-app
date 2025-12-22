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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {artists.map((artist) => (
        <Card key={artist.id} className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-3xl">
          <div className="aspect-[16/10] relative overflow-hidden bg-accent">
            {artist.image_url ? (
              <img
                src={artist.image_url}
                alt={artist.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
                <Music className="w-16 h-16 text-primary/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-md">
                  {artist.genre || 'Vocalist'}
                </Badge>
                <div className="flex items-center gap-0.5 ml-auto text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-bold">PRO</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{artist.name}</h3>
            </div>
            
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border rounded-xl">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <ExternalLink className="w-4 h-4" /> Public Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                    onClick={() => handleDelete(artist.id, artist.name)}
                  >
                    <Trash2 className="w-4 h-4" /> Remove Artist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 min-h-[4.5rem]">
              {artist.bio || 'Professional artist profile currently being updated. Check back soon for full biography and experience details.'}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-card bg-accent flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  +4
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 rounded-xl">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
