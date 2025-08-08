import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  submessage?: string;
}

export function LoadingOverlay({ 
  isOpen, 
  message = "Fetching Weather Data", 
  submessage = "Comparing accuracy across sources..." 
}: LoadingOverlayProps) {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="max-w-sm mx-4 bg-white rounded-2xl p-8 shadow-xl border-none">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">{message}</h3>
          <p className="text-neutral-600 text-sm">{submessage}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
