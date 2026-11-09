import { createFileRoute } from "@tanstack/react-router";
import { IR_BUCKET } from "@/lib/investor-relations";

/** Serves published website uploads directly, without redirects or expiring browser URLs. */
export const Route = createFileRoute("/files/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = params._splat ?? "";
        const { isPublishedFile, publicFileClient, validFilePath } = await import("@/lib/public-files.server");
        if (!validFilePath(path)) return new Response("Not found", { status: 404 });
        // Verify using anonymous RLS before loading the privileged storage client.
        if (!await isPublishedFile(publicFileClient(), path)) {
          return new Response("This file is not published or its record was not found on this server.", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
          if (!blob) return new Response("This file has not been uploaded to this server. Re-upload it from the admin portal.", { status: 404 });
          body = new Uint8Array(await blob.arrayBuffer());
          mime = blob.type || mime;
        }
        const ext = path.split(".").pop()?.toLowerCase() ?? "";
        const byExt: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", avif: "image/avif", pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm" };
        if (byExt[ext] && (!mime || mime === "application/octet-stream" || mime === "application/pdf")) mime = byExt[ext];
        const name = (path.split("/").pop() ?? "document").replace(/^\d+-/, "");
        const download = new URL(request.url).searchParams.has("download");
        return new Response(body as unknown as BodyInit, {
          headers: {
            "Content-Type": mime,
            "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name.replace(/[^\x20-\x7e]|["\\]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            ...(mime === "image/svg+xml" ? { "Content-Security-Policy": "script-src 'none'" } : {}),
          },
        });
      },
    },
  },
});
