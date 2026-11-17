import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

/** Renders a PDF onto canvases (no browser PDF plugin, so Edge can't block it). */
export function PdfCanvasViewer({ url }: { url: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = box.current;
    if (!el) return;
    el.innerHTML = "";
    setError(null);
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        const pdf = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;
        setPages(pdf.numPages);
        const width = Math.max(300, el.clientWidth - 32);
        const ratio = window.devicePixelRatio || 1;
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (width / base.width) * zoom });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width * ratio);
          canvas.height = Math.floor(vp.height * ratio);
          canvas.style.width = `${Math.floor(vp.width)}px`;
          canvas.style.height = `${Math.floor(vp.height)}px`;
          canvas.dataset['page'] = String(i);
          canvas.className = "mx-auto mb-4 block bg-background shadow";
          el.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp, transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined }).promise;
        }
      } catch {
        if (!cancelled) setError("This report could not be loaded. Please try again later.");
      }
    })();
    return () => { cancelled = true; };
  }, [url, zoom]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const s = e.currentTarget;
    const mid = s.scrollTop + s.clientHeight / 3;
    for (const c of Array.from(s.querySelectorAll("canvas"))) {
      const cv = c as HTMLCanvasElement;
      if (cv.offsetTop + cv.offsetHeight > mid) { setCurrent(Number(cv.dataset['page'])); break; }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-center gap-3 border-b border-border px-4 py-2 text-xs">
        <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="rounded-sm p-1 hover:bg-surface"><ZoomOut className="size-4" /></button>
        <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} className="rounded-sm p-1 hover:bg-surface"><ZoomIn className="size-4" /></button>
        <span className="ml-4 text-muted-foreground">{pages ? `Page ${current} of ${pages}` : "Loading…"}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-surface p-4" onScroll={onScroll} onContextMenu={(e) => e.preventDefault()}>
        {error && <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>}
        <div ref={box} />
      </div>
    </div>
  );
}
