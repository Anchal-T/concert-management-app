import { VenuesList } from '@/components/VenuesList';
import { AddVenueDialog } from '@/components/AddVenueDialog';

export default function VenuesPage() {
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Venues Registry</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage performance locations and their technical specifications.</p>
        </div>
        <AddVenueDialog />
      </div>

      <VenuesList />
    </div>
  );
}
