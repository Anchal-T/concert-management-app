import { ArtistsList } from '@/components/ArtistsList';
import { AddArtistDialog } from '@/components/AddArtistDialog';

export default function ArtistsPage() {
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Artists Roster</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and monitor your professional performance talent.</p>
        </div>
        <AddArtistDialog />
      </div>

      <ArtistsList />
    </div>
  );
}
