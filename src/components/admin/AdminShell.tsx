import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Columns2, ExternalLink, LogOut, PanelLeftClose, PanelLeftOpen, Rows2, UserPlus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Staff } from "@/lib/admin-auth";
import { ADMIN_MODULES, DASHBOARD_ICON, INVESTORS_ICON, USERS_ICON, investorGroups } from "@/lib/admin-modules";
import logo from "@/assets/ramky-infra-logo.png.asset.json";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Active = { kind: "dashboard" } | { kind: "investors"; section: string } | { kind: "users" } | { kind: "email" };
type Layout = "vertical" | "horizontal";
const LAYOUT_KEY = "ril-admin-layout";

const itemCls = (on: boolean) =>
  `relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${on ? "bg-primary-foreground/10 font-semibold text-primary-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-orange" : "hover:bg-primary-foreground/[0.06] hover:text-primary-foreground"}`;
const subCls = (on: boolean) =>
  `block w-full truncate rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${on ? "bg-brand-orange/15 font-semibold text-brand-orange" : "text-[var(--admin-nav-foreground)]/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"}`;
const iconWrap = (on: boolean) => `grid size-7 shrink-0 place-items-center rounded-md ${on ? "admin-accent" : "bg-primary-foreground/[0.06]"}`;
const hItem = (on: boolean) =>
  `inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${on ? "bg-primary-foreground/15 text-primary-foreground shadow-[inset_0_-3px_0_var(--brand-orange)]" : "text-[var(--admin-nav-foreground)]/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`;

export function AdminShell({ staff, active, crumbs, children }: { staff: Staff; active: Active; crumbs: string[]; children: ReactNode }) {
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [collapsed, setCollapsed] = useState(false);
  const [invOpen, setInvOpen] = useState(active.kind === "investors");
  const [usersOpen, setUsersOpen] = useState(active.kind === "users" || active.kind === "email");
  const groups = investorGroups();
  const activeGroup = active.kind === "investors" ? groups.find((g) => g.items.some((i) => i.key === active.section))?.label : undefined;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(activeGroup ? { [activeGroup]: true } : {});
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isSuper = staff.role === "super_admin";
  const initials = staff.fullName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "A";

  useEffect(() => {
    const v = localStorage.getItem(LAYOUT_KEY);
    if (v === "horizontal" || v === "vertical") setLayout(v);
  }, []);
  const changeLayout = (l: Layout) => { setLayout(l); localStorage.setItem(LAYOUT_KEY, l); };

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const Tip = ({ label, children: c }: { label: string; children: ReactNode }) =>
    collapsed ? (<Tooltip><TooltipTrigger asChild>{c}</TooltipTrigger><TooltipContent side="right">{label}</TooltipContent></Tooltip>) : (<>{c}</>);

  const vertical = layout === "vertical";

  const sidebar = (
    <aside className={`admin-nav hidden h-full shrink-0 flex-col transition-[width] duration-300 md:flex ${collapsed ? "w-[76px]" : "w-72"}`}>
      <nav className="thin-scroll thin-scroll-dark min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <Tip label="Dashboard">
          <Link to="/admin" search={{}} className={itemCls(active.kind === "dashboard")}><span className={iconWrap(active.kind === "dashboard")}><DASHBOARD_ICON className="size-4" /></span>{!collapsed && "Dashboard"}</Link>
        </Tip>
        {!collapsed && <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-nav-muted)]">Website modules</p>}
        {ADMIN_MODULES.map((m) => (
          <Tip key={m.key} label={`${m.label} — coming soon`}>
            <div className={`${itemCls(false)} cursor-not-allowed opacity-55`} aria-disabled>
              <span className={iconWrap(false)}><m.icon className="size-4" /></span>
              {!collapsed && <><span className="flex-1">{m.label}</span><span className="rounded-full border border-primary-foreground/15 px-2 py-0.5 text-[9px] uppercase tracking-wider">Soon</span></>}
            </div>
          </Tip>
        ))}
        <Tip label="Investors">
          <button onClick={() => { if (collapsed) { setCollapsed(false); setInvOpen(true); } else setInvOpen((o) => !o); }} className={itemCls(active.kind === "investors")}>
            <span className={iconWrap(active.kind === "investors")}><INVESTORS_ICON className="size-4" /></span>
            {!collapsed && <><span className="flex-1 text-left">Investors</span><ChevronDown className={`size-4 transition-transform duration-200 ${invOpen ? "" : "-rotate-90"}`} /></>}
          </button>
        </Tip>
        {!collapsed && invOpen && (
          <div className="ml-5 space-y-1 border-l border-primary-foreground/10 pl-2 animate-in fade-in slide-in-from-top-1">
            {groups.map((g) => {
              const open = openGroups[g.label] ?? false;
              return (
                <div key={g.label}>
                  <button onClick={() => setOpenGroups((s) => ({ ...s, [g.label]: !open }))} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[13px] font-medium text-primary-foreground/90 hover:bg-primary-foreground/5">
                    {g.label}<ChevronRight className={`size-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
                  </button>
                  {open && (
                    <div className="ml-2 space-y-0.5 py-1">
                      {g.items.map((i) => <Link key={i.key} to="/admin" search={{ section: i.key }} className={subCls(active.kind === "investors" && active.section === i.key)}>{i.label}</Link>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {isSuper && (
          <>
            {!collapsed && <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-nav-muted)]">Administration</p>}
            <Tip label="User Management">
              <button onClick={() => { if (collapsed) { setCollapsed(false); setUsersOpen(true); } else setUsersOpen((o) => !o); }} className={itemCls(active.kind === "users" || active.kind === "email")}>
                <span className={iconWrap(active.kind === "users" || active.kind === "email")}><USERS_ICON className="size-4" /></span>
                {!collapsed && <><span className="flex-1 text-left">User Management</span><ChevronDown className={`size-4 transition-transform duration-200 ${usersOpen ? "" : "-rotate-90"}`} /></>}
              </button>
            </Tip>
            {!collapsed && usersOpen && (
              <div className="ml-5 space-y-0.5 border-l border-primary-foreground/10 py-1 pl-2">
                <Link to="/admin/users" search={{}} className={subCls(active.kind === "users")}>All users</Link>
                <Link to="/admin/users" search={{ new: true }} className={subCls(false)}><span className="inline-flex items-center gap-1.5"><UserPlus className="size-3.5" /> Create user</span></Link>
                <Link to="/admin/email-settings" className={subCls(active.kind === "email")}><span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> Email Configuration</span></Link>
              </div>
            )}
          </>
        )}
      </nav>
      <div className="shrink-0 border-t border-primary-foreground/10 p-3">
        <Tip label="Sign out"><button onClick={signOut} className={itemCls(false)}><span className={iconWrap(false)}><LogOut className="size-4" /></span>{!collapsed && "Sign out"}</button></Tip>
      </div>
    </aside>
  );

  const horizontalNav = (
    <nav className="hidden shrink-0 items-center gap-1 overflow-x-auto admin-nav px-4 py-1.5 thin-scroll thin-scroll-dark md:flex md:px-6">
      <Link to="/admin" search={{}} className={hItem(active.kind === "dashboard")}><DASHBOARD_ICON className="size-4" /> Dashboard</Link>
      <DropdownMenu>
        <DropdownMenuTrigger className={hItem(active.kind === "investors")}><INVESTORS_ICON className="size-4" /> Investors <ChevronDown className="size-3.5" /></DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {groups.map((g) => (
            <DropdownMenuSub key={g.label}>
              <DropdownMenuSubTrigger>{g.label}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="thin-scroll max-h-[70vh] w-64 overflow-y-auto">
                {g.items.map((i) => (
                  <DropdownMenuItem key={i.key} onClick={() => navigate({ to: "/admin", search: { section: i.key } })} className={active.kind === "investors" && active.section === i.key ? "font-semibold text-brand-orange" : ""}>{i.label}</DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger className={hItem(false)}>Website modules <ChevronDown className="size-3.5" /></DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {ADMIN_MODULES.map((m) => <DropdownMenuItem key={m.key} disabled><m.icon className="size-4" /> {m.label}<span className="ml-auto text-[10px] uppercase">Soon</span></DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      {isSuper && (
        <DropdownMenu>
          <DropdownMenuTrigger className={hItem(active.kind === "users" || active.kind === "email")}><USERS_ICON className="size-4" /> User Management <ChevronDown className="size-3.5" /></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/users", search: {} })}>All users</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/users", search: { new: true } })}><UserPlus className="size-4" /> Create user</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/email-settings" })}><Mail className="size-4" /> Email Configuration</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="admin-canvas flex h-screen w-full overflow-hidden">
        {vertical && sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`z-20 flex h-16 shrink-0 items-center gap-3 px-4 md:px-6 relative bg-background shadow-sm`}>
            {vertical ? (
              <button onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar" className="hidden rounded-md p-2 text-muted-foreground hover:bg-surface hover:text-foreground md:inline-flex">
                {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
              </button>
            ) : null}
            <img src={logo.url} alt="Ramky Infrastructure" className="h-11 w-auto shrink-0" />
            <span className="mx-1 hidden h-8 w-px bg-border md:block" />
            <nav aria-label="Breadcrumb" className={`flex min-w-0 items-center gap-1.5 text-sm ${"text-muted-foreground"}`}>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 truncate">
                  {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
                  <span className={i === crumbs.length - 1 ? ("font-semibold text-foreground") : ""}>{c}</span>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <div role="group" aria-label="Menu layout" className={`hidden items-center rounded-lg p-0.5 md:flex ${"bg-surface"}`}>
                {(["vertical", "horizontal"] as const).map((l) => (
                  <Tooltip key={l}>
                    <TooltipTrigger asChild>
                      <button onClick={() => changeLayout(l)} aria-label={`${l} menu`} aria-pressed={layout === l}
                        className={`grid size-8 place-items-center rounded-md transition-colors ${layout === l ? "admin-accent shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        {l === "vertical" ? <Columns2 className="size-4" /> : <Rows2 className="size-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{l === "vertical" ? "Vertical menu" : "Horizontal menu"}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <a href="/investors" target="_blank" rel="noreferrer" className={`hidden items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm sm:inline-flex ${"border-border text-foreground/80 hover:bg-surface"}`}>View live site <ExternalLink className="size-3.5" /></a>
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 ${"hover:bg-surface"}`}>
                  <span className="admin-accent grid size-8 place-items-center rounded-full text-xs font-bold">{initials}</span>
                  <span className="hidden text-left leading-tight lg:block">
                    <span className={`block text-sm font-semibold ${"text-foreground"}`}>{staff.fullName}</span>
                    <span className={`block text-[11px] ${"text-muted-foreground"}`}>{isSuper ? "Super Admin" : "Admin"}</span>
                  </span>
                  <ChevronDown className="size-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel><p className="font-semibold">{staff.fullName}</p><p className="truncate text-xs font-normal text-muted-foreground">{staff.email}</p></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isSuper && <DropdownMenuItem onClick={() => navigate({ to: "/admin/users", search: {} })}><USERS_ICON className="size-4" /> User Management</DropdownMenuItem>}
                  <DropdownMenuItem onClick={signOut} className="text-destructive"><LogOut className="size-4" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="admin-accent-line absolute inset-x-0 bottom-0 h-[2px]" />
          </header>
          {!vertical && horizontalNav}
          <div className="shrink-0 border-b border-border bg-background px-4 py-2 md:hidden">
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
          <main className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:px-7 md:py-5">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
