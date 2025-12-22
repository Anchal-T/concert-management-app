import { ArtistsList } from '@/components/ArtistsList';
import { AddArtistDialog } from '@/components/AddArtistDialog';

export default function ArtistsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Artists</h1>
          <p className="text-zinc-500 mt-1">Manage your roster of performers and bands.</p>
        </div>
        <AddArtistDialog />
      </div>

      <ArtistsList />
    </div>
  );
}
