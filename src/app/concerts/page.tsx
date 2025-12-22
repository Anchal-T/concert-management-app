import { ConcertsList } from '@/components/ConcertsList';
import { ScheduleConcertDialog } from '@/components/ScheduleConcertDialog';

export default function ConcertsPage() {
  return (
    <div className="space-y-10 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Concerts Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm">Organize and manage your professional live event timeline.</p>
        </div>
        <ScheduleConcertDialog />
      </div>

      <ConcertsList />
    </div>
  );
}
