import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Req = { title: string; message: string; resolve: (ok: boolean) => void };
let push: ((r: Req) => void) | null = null;

/** Styled replacement for window.confirm; resolves true when the user confirms. */
export function confirmDelete(title: string, message = "This cannot be undone.") {
  return new Promise<boolean>((resolve) => (push ? push({ title, message, resolve }) : resolve(window.confirm(title))));
}

export function ConfirmDeleteHost() {
  const [req, setReq] = useState<Req | null>(null);
  useEffect(() => { push = setReq; return () => { push = null; }; }, []);
  const close = (ok: boolean) => { req?.resolve(ok); setReq(null); };
  return (
    <AlertDialog open={!!req} onOpenChange={(o) => !o && close(false)}>
      <AlertDialogContent className="max-w-sm text-center">
        <span className="btn-grad-danger mx-auto grid size-14 place-items-center rounded-full shadow-lg"><Trash2 className="size-6" /></span>
        <AlertDialogTitle className="mt-2 text-center font-display text-lg">{req?.title}</AlertDialogTitle>
        <AlertDialogDescription className="text-center">{req?.message}</AlertDialogDescription>
        <AlertDialogFooter className="mt-2 sm:justify-center">
          <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => close(true)} className="btn-grad-danger border-0 hover:opacity-90">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
