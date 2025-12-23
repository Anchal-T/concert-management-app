"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddArtistDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      name: formData.get('name') as string,
      genre: formData.get('genre') as string,
      bio: formData.get('bio') as string,
      imageUrl: formData.get('image_url') as string,
    };

    try {
      const res = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add artist');
      }

      toast.success('Artist added successfully');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 px-6 h-11 font-bold">
          <Plus className="w-5 h-5 mr-2" />
          Add Artist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0B101B] border-border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Add New Artist</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter the details of the artist you want to add to the registry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input id="name" name="name" placeholder="Artist or Band Name" required className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Genre</Label>
              <Input id="genre" name="genre" placeholder="e.g. Rock, Indie, Jazz" className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image URL</Label>
              <Input id="image_url" name="image_url" placeholder="https://..." className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Short biography..." className="bg-accent/20 border-border rounded-xl min-h-[100px] text-white placeholder:text-muted-foreground/50" />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6 font-bold hover:bg-accent/20">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Artist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
