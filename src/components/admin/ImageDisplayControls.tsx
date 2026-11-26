import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ACCOLADE_FITS, ACCOLADE_SHAPES, ACCOLADE_SIZES, DEFAULT_ACCOLADE_IMAGE } from "@/lib/accolade-image";
import { IMAGE_RESOLUTIONS } from "@/lib/image-resolution";
import { useSiteSettings } from "@/lib/site-settings.functions";
import { publishedFileUrl } from "@/lib/file-url";
import { registerImageOptions, saveImageDisplay } from "@/lib/image-display-admin";
import type { ImageDisplay } from "@/lib/image-display";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ImageDisplayControls({ imageRef, file }: { imageRef?: string | null | undefined; file?: File | null | undefined }) {
  const settings = useSiteSettings();
  const stored = settings.imageDisplays[publishedFileUrl(imageRef) ?? ""];
  const [options, setOptions] = useState<ImageDisplay>(stored ?? DEFAULT_ACCOLADE_IMAGE);
  const [enabled, setEnabled] = useState(!!stored);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  useEffect(() => { setOptions(stored ?? DEFAULT_ACCOLADE_IMAGE); setEnabled(!!stored); }, [imageRef, stored]);
  useEffect(() => { if (file && enabled) registerImageOptions(file, options); }, [file, enabled, options]);
  async function save(reset = false) {
    if (!imageRef) return;
    setBusy(true);
    try {
      await saveImageDisplay(imageRef, reset ? null : options);
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
      if (reset) { setEnabled(false); setOptions(DEFAULT_ACCOLADE_IMAGE); }
      toast.success(reset ? "Original layout restored" : "Photo options saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to save photo options"); }
    finally { setBusy(false); }
  }
  const update = (key: keyof ImageDisplay, value: string) => { setEnabled(true); setOptions((o) => ({ ...o, [key]: value })); };
  return <div className="mt-3 space-y-3" aria-label="Image adjustment options">
    <div className="grid gap-3 sm:grid-cols-2">
      {([
        ["shape", "Photo shape", ACCOLADE_SHAPES], ["fit", "Photo fit", ACCOLADE_FITS],
        ["size", "Photo size", ACCOLADE_SIZES], ["resolution", "Upload resolution", IMAGE_RESOLUTIONS],
      ] as const).map(([key, label, choices]) => <Label key={key} className="grid min-w-0 gap-1 text-xs">{label}
        <select aria-label={label} value={options[key]} disabled={busy} onChange={(e) => update(key, e.target.value)} className="h-9 w-full min-w-0 rounded-sm border border-input bg-background px-2 text-xs">
          {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
        </select>
      </Label>)}
    </div>
    {file ? <p className="text-xs text-muted-foreground">Photo options will be applied when you save this upload.</p> : imageRef ? <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => save()}><Save className="size-3.5" /> Save photo options</Button>
      <Button type="button" size="sm" variant="ghost" disabled={busy || !stored} onClick={() => save(true)}><RotateCcw className="size-3.5" /> Original layout</Button>
    </div> : <p className="text-xs text-muted-foreground">Choose your photo options, then upload and save the image.</p>}
  </div>;
}