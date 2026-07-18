import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CalendarDays, CheckCircle2, Clock3, Loader2, LogOut, Mail, Phone,
  Search, User2, XCircle, Sparkles, ArrowLeft, ClipboardList,
} from "lucide-react";
import { formatTime12 } from "@/lib/clinic";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Staff Dashboard — Changez Khan Dental" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Appt = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  message: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

function AdminPage() {
  const [session, setSession] = useState<null | { email?: string }>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { email: data.session.user.email ?? "" } : null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s ? { email: s.user.email ?? "" } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  return session ? <Dashboard email={session.email ?? ""} /> : <LoginCard />;
}

/* ---------- LOGIN ---------- */
function LoginCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password: pw,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Account created. You may need to confirm your email.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      setLoading(false);
      if (error) return toast.error(error.message);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
        <div className="card-elevated p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Staff Portal</div>
              <div className="text-xs text-muted-foreground">Changez Khan Dental</div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e">Email</Label>
              <Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- DASHBOARD ---------- */
function Dashboard({ email }: { email: string }) {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"today" | "upcoming" | "completed" | "cancelled" | "calendar">("today");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("appointments")
      .select("*").order("appointment_date").order("appointment_time");
    if (error) toast.error(error.message);
    else setAppts((data as Appt[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().slice(0, 10);

  const stats = useMemo(() => ({
    total: appts.length,
    pending: appts.filter((a) => a.status === "pending").length,
    confirmed: appts.filter((a) => a.status === "confirmed").length,
    today: appts.filter((a) => a.appointment_date === todayISO && a.status !== "cancelled").length,
    completed: appts.filter((a) => a.status === "completed").length,
  }), [appts, todayISO]);

  const filtered = useMemo(() => {
    let list = appts;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((a) =>
        a.full_name.toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q));
    }
    if (tab === "today") list = list.filter((a) => a.appointment_date === todayISO && a.status !== "cancelled");
    else if (tab === "upcoming") list = list.filter((a) => a.appointment_date > todayISO && a.status !== "cancelled" && a.status !== "completed");
    else if (tab === "completed") list = list.filter((a) => a.status === "completed");
    else if (tab === "cancelled") list = list.filter((a) => a.status === "cancelled");
    return list;
  }, [appts, tab, statusFilter, query, todayISO]);

  async function updateStatus(id: string, status: Appt["status"]) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const StatCard = ({ icon: Icon, label, value, tone }: any) => (
    <div className="card-elevated flex items-center gap-4 p-5">
      <div className={cn("grid h-11 w-11 place-items-center rounded-xl text-white shadow-md", tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">Practice Dashboard</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Changez Khan Dental</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-muted-foreground sm:block">{email}</div>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={ClipboardList} label="Total" value={stats.total} tone="gradient-primary" />
          <StatCard icon={Clock3} label="Pending" value={stats.pending} tone="bg-warning" />
          <StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmed} tone="bg-success" />
          <StatCard icon={CalendarDays} label="Today" value={stats.today} tone="gradient-coral" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="bg-primary" />
        </div>

        {/* tabs + filters */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-border bg-surface-elevated p-1">
            {(["today", "upcoming", "completed", "cancelled", "calendar"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all",
                  tab === t ? "gradient-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
                {t}
              </button>
            ))}
          </div>
          {tab !== "calendar" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patients…" className="pl-9 w-56" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-16 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : tab === "calendar" ? (
          <CalendarView appts={appts} />
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">No appointments in this view.</div>
        ) : (
          <div className="mt-6 grid gap-3">
            {filtered.map((a) => <ApptCard key={a.id} a={a} onStatus={updateStatus} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function ApptCard({ a, onStatus }: { a: Appt; onStatus: (id: string, s: Appt["status"]) => void }) {
  const d = new Date(a.appointment_date + "T00:00:00");
  const dateStr = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const tone = {
    pending: "bg-warning/15 text-warning-foreground border-warning/40",
    confirmed: "bg-success/15 text-success border-success/40",
    completed: "bg-primary/10 text-primary border-primary/40",
    cancelled: "bg-destructive/10 text-destructive border-destructive/40",
  }[a.status];

  return (
    <div className="card-elevated grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-xl gradient-primary text-primary-foreground text-center">
          <div>
            <div className="text-[10px] font-bold uppercase leading-none">{dateStr.split(" ")[1]}</div>
            <div className="text-lg font-bold leading-none">{d.getDate()}</div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <div className="font-semibold">{a.full_name}</div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{dateStr} · {formatTime12(String(a.appointment_time).slice(0, 8))}</div>
        </div>
      </div>
      <div className="min-w-0 space-y-1 text-sm">
        {a.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /><span className="truncate">{a.email}</span></div>}
        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /><span>{a.phone}</span></div>
        {a.message && <div className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground line-clamp-2">"{a.message}"</div>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={cn("rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider", tone)}>{a.status}</span>
        <div className="flex flex-wrap gap-1">
          {a.status !== "completed" && (
            <Button size="sm" variant="outline" onClick={() => onStatus(a.id, "completed")}>Complete</Button>
          )}
          {a.status !== "cancelled" && (
            <Button size="sm" variant="ghost" onClick={() => onStatus(a.id, "cancelled")}><XCircle className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ appts }: { appts: Appt[] }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [picked, setPicked] = useState<string | null>(null);
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startDay = start.getDay();
  const daysInMonth = end.getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = useMemo(() => {
    const map: Record<string, Appt[]> = {};
    for (const a of appts) (map[a.appointment_date] ??= []).push(a);
    return map;
  }, [appts]);

  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card-elevated p-6">
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>←</button>
          <div className="font-display text-lg font-bold">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </div>
          <button className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dISO = iso(d);
            const count = (byDate[dISO] ?? []).filter(a => a.status !== "cancelled").length;
            const isPicked = picked === dISO;
            return (
              <button key={i} onClick={() => setPicked(dISO)}
                className={cn("flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-all",
                  isPicked ? "border-primary bg-primary text-primary-foreground shadow" : "border-border hover:bg-muted",
                  count > 0 && !isPicked && "border-primary/30 bg-primary-soft/40")}>
                <span className="font-semibold">{d.getDate()}</span>
                {count > 0 && <span className={cn("mt-0.5 text-[9px]", isPicked ? "opacity-90" : "text-primary font-bold")}>{count} appt</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="card-elevated p-6">
        <div className="mb-3 font-semibold">
          {picked ? new Date(picked + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "Select a date"}
        </div>
        <div className="space-y-2">
          {(picked ? (byDate[picked] ?? []).filter(a => a.status !== "cancelled") : []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No bookings for this day.</div>
          ) : (
            (byDate[picked!] ?? []).filter(a => a.status !== "cancelled").sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{formatTime12(String(a.appointment_time).slice(0, 8))}</div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.status}</span>
                </div>
                <div>{a.full_name}</div>
                <div className="text-xs text-muted-foreground">{a.phone}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
