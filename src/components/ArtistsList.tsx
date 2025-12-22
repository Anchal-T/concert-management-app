"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Trash2, Edit2, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ArtistsList() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artist?')) return;

    const { error } = await supabase.from('artists').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete artist');
    } else {
      toast.success('Artist deleted');
      fetchArtists();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <Music className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
        <h3 className="text-lg font-medium text-black dark:text-white">No artists found</h3>
        <p className="text-zinc-500 mt-1">Add your first artist to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artists.map((artist) => (
        <Card key={artist.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
            {artist.image_url ? (
              <img
                src={artist.image_url}
                alt={artist.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <User className="w-12 h-12 text-zinc-300" />
            )}
            <div className="absolute top-2 right-2 flex gap-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 dark:bg-zinc-900/90" onClick={() => {}}>
                <Edit2 className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              </Button>
              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(artist.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{artist.name}</CardTitle>
                <CardDescription className="text-zinc-500 font-medium uppercase tracking-wider text-xs mt-1">
                  {artist.genre || 'Various'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 min-h-[4.5rem]">
              {artist.bio || 'No biography available for this artist.'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
