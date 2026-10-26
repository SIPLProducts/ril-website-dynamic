import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ExternalLink, LogOut, PanelLeftClose, PanelLeftOpen, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Staff } from "@/lib/admin-auth";
import { ADMIN_MODULES, DASHBOARD_ICON, INVESTORS_ICON, USERS_ICON, investorGroups } from "@/lib/admin-modules";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Active = { kind: "dashboard" } | { kind: "investors"; section: string } | { kind: "users" };

const itemCls = (on: boolean) =>
  `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${on ? "admin-accent font-semibold shadow-sm" : "hover:bg-primary-foreground/10 hover:text-primary-foreground"}`;
const subCls = (on: boolean) =>
  `block w-full truncate rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${on ? "bg-primary-foreground/10 font-semibold text-brand-orange" : "text-[var(--admin-nav-foreground)]/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"}`;

export function AdminShell({ staff, active, crumbs, children }: { staff: Staff; active: Active; crumbs: string[]; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [invOpen, setInvOpen] = useState(active.kind === "investors");
  const [usersOpen, setUsersOpen] = useState(active.kind === "users");
  const groups = investorGroups();
  const activeGroup = active.kind === "investors" ? groups.find((g) => g.items.some((i) => i.key === active.section))?.label : undefined;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(activeGroup ? { [activeGroup]: true } : {});
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isSuper = staff.role === "super_admin";
  const initials = staff.fullName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "A";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const Tip = ({ label, children: c }: { label: string; children: ReactNode }) =>
    collapsed ? (
      <Tooltip><TooltipTrigger asChild>{c}</TooltipTrigger><TooltipContent side="right">{label}</TooltipContent></Tooltip>
    ) : (<>{c}</>);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="admin-canvas flex min-h-screen w-full">
        <aside className={`admin-nav sticky top-0 hidden h-screen shrink-0 flex-col transition-[width] duration-200 md:flex ${collapsed ? "w-[72px]" : "w-72"}`}>
          <div className="flex h-16 items-center gap-3 border-b border-primary-foreground/10 px-4">
            <span className="admin-accent grid size-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold">RI</span>
            {!collapsed && (
              <div className="leading-tight">
                <p className="font-display text-sm font-bold tracking-wide text-primary-foreground">RAMKY INFRA</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--admin-nav-muted)]">Admin Portal</p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <Tip label="Dashboard">
              <Link to="/admin" search={{}} className={itemCls(active.kind === "dashboard")}><DASHBOARD_ICON className="size-4 shrink-0" />{!collapsed && "Dashboard"}</Link>
            </Tip>

            {!collapsed && <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-nav-muted)]">Website modules</p>}

            {ADMIN_MODULES.map((m) => (
              <Tip key={m.key} label={`${m.label} — coming soon`}>
                <div className={`${itemCls(false)} cursor-not-allowed opacity-60`} aria-disabled>
                  <m.icon className="size-4 shrink-0" />
                  {!collapsed && <><span className="flex-1">{m.label}</span><span className="rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">Soon</span></>}
                </div>
              </Tip>
            ))}

            <Tip label="Investors">
              <button onClick={() => { if (collapsed) setCollapsed(false); setInvOpen((o) => !o || collapsed); }} className={itemCls(false) + (active.kind === "investors" ? " text-primary-foreground" : "")}>
                <INVESTORS_ICON className="size-4 shrink-0" />
                {!collapsed && <><span className="flex-1 text-left">Investors</span>{invOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</>}
              </button>
            </Tip>
            {!collapsed && invOpen && (
              <div className="ml-4 space-y-1 border-l border-primary-foreground/10 pl-2">
                {groups.map((g) => {
                  const open = openGroups[g.label] ?? false;
                  return (
                    <div key={g.label}>
                      <button onClick={() => setOpenGroups((s) => ({ ...s, [g.label]: !open }))} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[13px] font-medium text-primary-foreground/90 hover:bg-primary-foreground/5">
                        {g.label}{open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      </button>
                      {open && (
                        <div className="ml-2 space-y-0.5 py-1">
                          {g.items.map((i) => (
                            <Link key={i.key} to="/admin" search={{ section: i.key }} className={subCls(active.kind === "investors" && active.section === i.key)}>{i.label}</Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isSuper && (
              <>
                {!collapsed && <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-nav-muted)]">Administration</p>}
                <Tip label="User Management">
                  <button onClick={() => { if (collapsed) setCollapsed(false); setUsersOpen((o) => !o || collapsed); }} className={itemCls(false) + (active.kind === "users" ? " text-primary-foreground" : "")}>
                    <USERS_ICON className="size-4 shrink-0" />
                    {!collapsed && <><span className="flex-1 text-left">User Management</span>{usersOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</>}
                  </button>
                </Tip>
                {!collapsed && usersOpen && (
                  <div className="ml-4 space-y-0.5 border-l border-primary-foreground/10 py-1 pl-2">
                    <Link to="/admin/users" search={{}} className={subCls(active.kind === "users")}>All users</Link>
                    <Link to="/admin/users" search={{ new: true }} className={subCls(false)}><span className="inline-flex items-center gap-1.5"><UserPlus className="size-3.5" /> Create user</span></Link>
                  </div>
                )}
              </>
            )}
          </nav>

          <div className="border-t border-primary-foreground/10 p-3">
            <Tip label="Sign out">
              <button onClick={signOut} className={itemCls(false)}><LogOut className="size-4 shrink-0" />{!collapsed && "Sign out"}</button>
            </Tip>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
            <button onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar" className="hidden rounded-md p-2 text-muted-foreground hover:bg-surface hover:text-foreground md:inline-flex">
              {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 truncate">
                  {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
                  <span className={i === crumbs.length - 1 ? "font-semibold text-foreground" : ""}>{c}</span>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <a href="/investors" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground/80 hover:bg-surface sm:inline-flex">View live site <ExternalLink className="size-3.5" /></a>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-surface">
                  <span className="admin-accent grid size-8 place-items-center rounded-full text-xs font-bold">{initials}</span>
                  <span className="hidden text-left leading-tight lg:block">
                    <span className="block text-sm font-semibold text-foreground">{staff.fullName}</span>
                    <span className="block text-[11px] text-muted-foreground">{isSuper ? "Super Admin" : "Admin"}</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel><p className="font-semibold">{staff.fullName}</p><p className="truncate text-xs font-normal text-muted-foreground">{staff.email}</p></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isSuper && <DropdownMenuItem onClick={() => navigate({ to: "/admin/users", search: {} })}><USERS_ICON className="size-4" /> User Management</DropdownMenuItem>}
                  <DropdownMenuItem onClick={signOut} className="text-destructive"><LogOut className="size-4" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {/* Mobile module picker */}
          <div className="border-b border-border bg-background px-4 py-2 md:hidden">
            <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={active.kind === "investors" ? active.section : active.kind} onChange={(e) => {
              const v = e.target.value;
              if (v === "dashboard") navigate({ to: "/admin", search: {} });
              else if (v === "users") navigate({ to: "/admin/users", search: {} });
              else navigate({ to: "/admin", search: { section: v } });
            }}>
              <option value="dashboard">Dashboard</option>
              {groups.map((g) => <optgroup key={g.label} label={`Investors · ${g.label}`}>{g.items.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}</optgroup>)}
              {isSuper && <option value="users">User Management</option>}
            </select>
          </div>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
