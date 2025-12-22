import { ArtistsList } from '@/components/ArtistsList';
import { AddArtistDialog } from '@/components/AddArtistDialog';

export default function ArtistsPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Artists Roster</h1>
        </div>
        <AddArtistDialog />
      </div>

      <ArtistsList />
    </div>
  );
}
