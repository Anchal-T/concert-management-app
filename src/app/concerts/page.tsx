import { ConcertsList } from '@/components/ConcertsList';
import { ScheduleConcertDialog } from '@/components/ScheduleConcertDialog';

export default function ConcertsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Concerts</h1>
          <p className="text-zinc-500 mt-1">Schedule and manage your upcoming live events.</p>
        </div>
        <ScheduleConcertDialog />
      </div>

      <ConcertsList />
    </div>
  );
}
