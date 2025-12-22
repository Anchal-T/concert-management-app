import { VenuesList } from '@/components/VenuesList';
import { AddVenueDialog } from '@/components/AddVenueDialog';

export default function VenuesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Venues</h1>
          <p className="text-zinc-500 mt-1">Manage performance locations and their specifications.</p>
        </div>
        <AddVenueDialog />
      </div>

      <VenuesList />
    </div>
  );
}
