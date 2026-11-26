import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ACCOLADE_FITS, ACCOLADE_SHAPES, ACCOLADE_SIZES, DEFAULT_ACCOLADE_IMAGE } from "@/lib/accolade-image";
import { IMAGE_RESOLUTIONS } from "@/lib/image-resolution";
import { siteSettingsQuery } from "@/lib/site-settings.functions";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";
import { registerImageOptions, saveImageDisplay } from "@/lib/image-display-admin";
import { imageDisplaySource, type ImageDisplay } from "@/lib/image-display";
import { useHomePreview } from "@/lib/home-highlights-admin";
import { ImagePresentation } from "@/components/site/AdjustableImage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ImageDisplayControls({ imageRef, file, onOptionsChange }: { imageRef?: string | null | undefined; file?: File | null | undefined; onOptionsChange?: (options: ImageDisplay) => void }) {
  const { data: settings = DEFAULT_SETTINGS, isFetching } = useQuery({ ...siteSettingsQuery(), refetchOnMount: "always" });
  const stored = settings.imageDisplays[imageDisplaySource(imageRef)];
  const [options, setOptions] = useState<ImageDisplay>(stored ?? DEFAULT_ACCOLADE_IMAGE);
  const [enabled, setEnabled] = useState(!!stored);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const existing = useHomePreview(imageRef);
  const [local, setLocal] = useState<string | null>(null);
  useEffect(() => { if (!file) { setLocal(null); return; } const url = URL.createObjectURL(file); setLocal(url); return () => URL.revokeObjectURL(url); }, [file]);
  useEffect(() => { setOptions(stored ?? DEFAULT_ACCOLADE_IMAGE); setEnabled(!!stored); }, [imageRef, stored]);
  useEffect(() => { if (stored) onOptionsChange?.(stored); }, [stored, onOptionsChange]);
  useEffect(() => { if (file) registerImageOptions(file, options); }, [file, options]);
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
  const update = (key: keyof ImageDisplay, value: string) => { const next = { ...options, [key]: value }; setEnabled(true); setOptions(next); if (file) registerImageOptions(file, next); onOptionsChange?.(next); };
  return <div className="mt-3 space-y-3" aria-label="Image adjustment options">
    {(local || existing) && (enabled || file) && <div className="mx-auto w-full max-w-48"><ImagePresentation src={local ?? existing ?? ""} alt="Photo adjustment preview" options={options} className="rounded-sm" /></div>}
    <div className="grid gap-3 sm:grid-cols-2">
      {([
        ["shape", "Photo shape", ACCOLADE_SHAPES], ["fit", "Photo fit", ACCOLADE_FITS],
        ["size", "Photo size", ACCOLADE_SIZES], ["resolution", "Upload resolution", IMAGE_RESOLUTIONS],
      ] as const).map(([key, label, choices]) => <Label key={key} className="grid min-w-0 gap-1 text-xs">{label}
        <select aria-label={label} value={options[key]} disabled={busy || isFetching} onChange={(e) => update(key, e.target.value)} className="h-9 w-full min-w-0 rounded-sm border border-input bg-background px-2 text-xs">
          {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
        </select>
      </Label>)}
    </div>
    {file ? <p className="text-xs text-muted-foreground">Photo options will be applied when you save this upload.</p> : imageRef ? <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" disabled={busy || isFetching} onClick={() => save()}><Save className="size-3.5" /> Save photo options</Button>
      <Button type="button" size="sm" variant="ghost" disabled={busy || isFetching || !stored} onClick={() => save(true)}><RotateCcw className="size-3.5" /> Original layout</Button>
    </div> : <p className="text-xs text-muted-foreground">Choose your photo options, then upload and save the image.</p>}
  </div>;
}