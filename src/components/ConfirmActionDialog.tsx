"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmActionDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  trigger: React.ReactNode;
  onConfirm: () => Promise<void>;
  confirmVariant?: 'default' | 'destructive';
}

/**
 * Renders a confirm dialog around an arbitrary trigger.
 * Exists to ensure destructive UI actions always have a real, safe flow.
 */
export function ConfirmActionDialog({
  title,
  description,
  confirmLabel,
  trigger,
  onConfirm,
  confirmVariant = 'destructive',
}: ConfirmActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Runs the caller-provided confirm action while showing a loading state.
   * Exists to prevent accidental double-submits and to close on success.
   */
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-[#0B101B] border-border rounded-3xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="rounded-xl h-11 px-6 font-bold hover:bg-accent/20 bg-transparent border-border text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-xl h-11 px-6 font-bold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
