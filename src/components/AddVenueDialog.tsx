"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddVenueDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      capacity: parseInt(formData.get('capacity') as string),
      address: formData.get('address') as string,
    };

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add venue');
      }

      toast.success('Venue added successfully');
      setOpen(false);
      router.refresh();
      window.location.reload();
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
          Add Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0B101B] border-border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Add New Venue</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter the technical details and location of the venue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Venue Name</Label>
              <Input id="name" name="name" placeholder="Madison Square Garden" required className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
                <Input id="city" name="city" placeholder="New York" className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State/Province</Label>
                <Input id="state" name="state" placeholder="NY" className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" placeholder="20000" className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</Label>
              <Input id="address" name="address" placeholder="4 Pennsylvania Plaza" className="bg-accent/20 border-border rounded-xl h-11 text-white placeholder:text-muted-foreground/50" />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6 font-bold hover:bg-accent/20">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Venue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}