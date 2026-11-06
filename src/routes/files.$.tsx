import { createFileRoute } from "@tanstack/react-router";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";

/** Serves published investor documents from the database (falls back to file storage). */
export const Route = createFileRoute("/files/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = decodeURIComponent(params._splat ?? "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: doc } = await supabaseAdmin.from("ir_documents").select("id").eq("url", STORAGE_PREFIX + path).eq("published", true).limit(1).maybeSingle();
        if (!doc) return new Response("Not found", { status: 404 });

        let body: Uint8Array | null = null;
        let mime = "application/pdf";
        const { data: row } = await supabaseAdmin.from("ir_files").select("mime,data").eq("path", path).maybeSingle();
        if (row?.data) {
          const hex = String(row.data).replace(/^\\x/, "");
          body = new Uint8Array(hex.length / 2);
          for (let i = 0; i < body.length; i++) body[i] = parseInt(hex.substr(i * 2, 2), 16);
          mime = row.mime;
        } else {
          const { data: blob } = await supabaseAdmin.storage.from(IR_BUCKET).download(path);
          if (!blob) return new Response("Not found", { status: 404 });
          body = new Uint8Array(await blob.arrayBuffer());
          mime = blob.type || mime;
        }
        const name = (path.split("/").pop() ?? "document").replace(/^\d+-/, "");
        const download = new URL(request.url).searchParams.has("download");
        return new Response(body as unknown as BodyInit, {
          headers: {
            "Content-Type": mime,
            "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name.replace(/"/g, "")}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
