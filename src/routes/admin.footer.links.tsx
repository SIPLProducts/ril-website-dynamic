import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FormSection, adminSelect } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/footer/links")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Col = { id: string; title: string; published: boolean; sort_order: number };
type LinkRow = { id: string; column_id: string; label: string; href: string; new_tab: boolean; published: boolean; sort_order: number };

/** Website pages offered in the link picker. */
const SITE_PAGES: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About Us (home section)", href: "/#about" },
  { label: "Management (home section)", href: "/#management" },
  { label: "Capabilities (home section)", href: "/#businesses" },
  { label: "CSR (opens CSR card)", href: "/#csr" },
  { label: "Awards & Accreditations", href: "/accolades" },
  { label: "Media", href: "/media" },
  { label: "Clientele", href: "/about/clientele" },
  { label: "Partners & Subsidiaries", href: "/about/partners/subsidiaries" },
  { label: "History & Milestones", href: "/history-milestones" },
  { label: "Senior Management", href: "/senior-management" },
  { label: "Life at Ramky", href: "/life-at-ramky" },
  { label: "Current Positions", href: "/current-positions" },
  { label: "Investors — Financial Results", href: "/investors?cat=financials" },
  { label: "Investors — Corporate Governance", href: "/investors?cat=corporate-governance" },
  { label: "Investors — Shareholders Information", href: "/investors?cat=shareholders-information" },
  { label: "Investors — Stock Exchange Filings", href: "/investors?cat=stock-exchange-filings" },
  { label: "Sustainability — Environmental", href: "/esg/environmental" },
  { label: "Sustainability — Social", href: "/esg/social" },
  { label: "Sustainability — Governance", href: "/esg/governance" },
  { label: "Sustainability — ESG Reporting", href: "/esg/esg-reporting" },
];

function Page() {
  const { staff } = Route.useRouteContext();
  const qc = useQueryClient();
  const [editCol, setEditCol] = useState<Col | "new" | null>(null);
  const [editLink, setEditLink] = useState<{ col: Col; row: LinkRow | null } | null>(null);
  const { data } = useQuery({ queryKey: ["admin-footer-links"], queryFn: async () => {
    const [c, l] = await Promise.all([
      supabase.from("footer_columns").select("id,title,published,sort_order").order("sort_order"),
      supabase.from("footer_links").select("id,column_id,label,href,new_tab,published,sort_order").order("sort_order"),
    ]);
    if (c.error) throw c.error;
    if (l.error) throw l.error;
    return { cols: c.data as Col[], links: l.data as LinkRow[] };
  } });
  const cols = data?.cols ?? [];
  const links = data?.links ?? [];
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-footer-links"] }); qc.invalidateQueries({ queryKey: ["footer"] }); };

  async function swap(table: "footer_columns" | "footer_links", a?: { id: string; sort_order: number }, b?: { id: string; sort_order: number }) {
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function toggle(table: "footer_columns" | "footer_links", id: string, published: boolean) {
    const { error } = await supabase.from(table).update({ published: !published }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }
  async function removeCol(c: Col) {
    const n = links.filter((l) => l.column_id === c.id).length;
    if (!(await confirmDelete(`Delete column "${c.title}"?`, n ? `Its ${n} link(s) will also be deleted. This cannot be undone.` : undefined))) return;
    const { error } = await supabase.from("footer_columns").delete().eq("id", c.id);
    if (error) toast.error(error.message); else { toast.success("Column deleted"); refresh(); }
  }
  async function removeLink(l: LinkRow) {
    if (!(await confirmDelete(`Delete link "${l.label}"?`))) return;
    const { error } = await supabase.from("footer_links").delete().eq("id", l.id);
    if (error) toast.error(error.message); else { toast.success("Link deleted"); refresh(); }
  }

  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "footer", section: "links" }} crumbs={["Footer", "Link Columns"]}>
      <div className="space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="font-display text-xl font-bold">Footer link columns</h2>
            <p className="text-sm text-muted-foreground">The link columns at the bottom of every website page (Company, Businesses, People & Careers, Investors). Each card below is one column.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="/#contact" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
            <Button onClick={() => setEditCol("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add column</Button>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          {cols.map((c, ci) => {
            const items = links.filter((l) => l.column_id === c.id);
            return (
              <section key={c.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
                  <div className="flex items-center gap-2">
                    <button aria-label="Move column left" disabled={ci === 0} onClick={() => swap("footer_columns", c, cols[ci - 1])} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                    <button aria-label="Move column right" disabled={ci === cols.length - 1} onClick={() => swap("footer_columns", c, cols[ci + 1])} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Column {ci + 1} heading</p>
                      <h3 className="font-display text-lg font-bold">{c.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Switch checked={c.published} onCheckedChange={() => toggle("footer_columns", c.id, c.published)} /> Live</label>
                    <button aria-label="Rename column" onClick={() => setEditCol(c)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                    <button aria-label="Delete column" onClick={() => removeCol(c)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {items.map((l, i) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-2">
                      <div className="flex gap-1">
                        <button aria-label="Move up" disabled={i === 0} onClick={() => swap("footer_links", l, items[i - 1])} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3" /></button>
                        <button aria-label="Move down" disabled={i === items.length - 1} onClick={() => swap("footer_links", l, items[i + 1])} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3" /></button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.label}{l.new_tab && <ExternalLink className="ml-1 inline size-3 text-muted-foreground" />}</p>
                        <p className="truncate text-xs text-muted-foreground">{l.href}</p>
                      </div>
                      <Switch checked={l.published} onCheckedChange={() => toggle("footer_links", l.id, l.published)} aria-label="Live" />
                      <button aria-label="Edit" onClick={() => setEditLink({ col: c, row: l })} className="btn-grad-edit grid size-7 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-3.5" /></button>
                      <button aria-label="Delete" onClick={() => removeLink(l)} className="btn-grad-danger grid size-7 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-3.5" /></button>
                    </li>
                  ))}
                  {!items.length && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No links in this column yet.</li>}
                </ul>
                <div className="border-t border-border p-3">
                  <Button variant="outline" size="sm" onClick={() => setEditLink({ col: c, row: null })}><Plus className="size-4" /> Add link to {c.title}</Button>
                </div>
              </section>
            );
          })}
        </div>
      </div>
      {editCol && <ColumnDialog row={editCol === "new" ? null : editCol} nextOrder={(cols.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditCol(null)} onSaved={() => { setEditCol(null); refresh(); }} />}
      {editLink && <LinkDialog col={editLink.col} row={editLink.row} nextOrder={(links.filter((l) => l.column_id === editLink.col.id).at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditLink(null)} onSaved={() => { setEditLink(null); refresh(); }} />}
    </AdminShell>
  );
}

function ColumnDialog({ row, nextOrder, onClose, onSaved }: { row: Col | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(row?.title ?? "");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!title.trim()) { toast.error("Column heading is required"); return; }
    setSaving(true);
    const { error } = row
      ? await supabase.from("footer_columns").update({ title: title.trim() }).eq("id", row.id)
      : await supabase.from("footer_columns").insert({ title: title.trim(), sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website footer"); onSaved();
  }
  return (
    <AdminDialog icon={Link2} title={row ? "Rename column" : "Add column"} subtitle="A heading in the website footer with links below it" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save" : "Add column"}</Button></>}>
      <FormSection title="Column">
        <div><Label>Column heading *</Label><Input value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Company" /></div>
      </FormSection>
    </AdminDialog>
  );
}

function LinkDialog({ col, row, nextOrder, onClose, onSaved }: { col: Col; row: LinkRow | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const known = row ? SITE_PAGES.some((p) => p.href === row.href) : true;
  const [mode, setMode] = useState<"page" | "custom">(known ? "page" : "custom");
  const [label, setLabel] = useState(row?.label ?? "");
  const [href, setHref] = useState(row?.href ?? "");
  const [newTab, setNewTab] = useState(row?.new_tab ?? false);
  const [published, setPublished] = useState(row?.published ?? true);
  const [saving, setSaving] = useState(false);
  async function save() {
    const h = href.trim();
    if (!label.trim()) { toast.error("Link text is required"); return; }
    if (!h) { toast.error("Please choose a page or enter a link"); return; }
    if (!/^(\/|https?:\/\/|mailto:|tel:)/i.test(h)) { toast.error("Link must start with / (website page) or https://"); return; }
    setSaving(true);
    const payload = { label: label.trim(), href: h, new_tab: newTab, published };
    const { error } = row
      ? await supabase.from("footer_links").update(payload).eq("id", row.id)
      : await supabase.from("footer_links").insert({ ...payload, column_id: col.id, sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(published ? "Saved — now live on the website footer" : "Saved as hidden"); onSaved();
  }
  return (
    <AdminDialog icon={Link2} title={row ? "Edit link" : "Add link"} subtitle={`In the "${col.title}" footer column`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add link"}</Button></>}>
      <FormSection title="Link">
        <div><Label>Link text *</Label><Input value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Media" /></div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="radio" checked={mode === "page"} onChange={() => setMode("page")} /> A page on this website</label>
          <label className="flex items-center gap-2"><input type="radio" checked={mode === "custom"} onChange={() => setMode("custom")} /> Other link (another website)</label>
        </div>
        {mode === "page" ? (
          <div><Label>Website page *</Label>
            <select className={adminSelect} value={href} onChange={(e) => { setHref(e.target.value); if (!label) setLabel(SITE_PAGES.find((p) => p.href === e.target.value)?.label.split(" (")[0] ?? ""); }}>
              <option value="">Choose a page…</option>
              {SITE_PAGES.map((p) => <option key={p.href} value={p.href}>{p.label}</option>)}
            </select>
          </div>
        ) : (
          <div><Label>Link address *</Label><Input value={href} maxLength={500} onChange={(e) => setHref(e.target.value)} placeholder="https://…" /></div>
        )}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm"><Switch checked={newTab} onCheckedChange={setNewTab} /> Open in a new tab</label>
          <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
        </div>
      </FormSection>
    </AdminDialog>
  );
}
