import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarCheck, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { next15Days, slotsForDate, formatTime12, CLINIC } from "@/lib/clinic";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  message: string;
}

export function BookingForm() {
  const days = useMemo(() => next15Days(), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    days.find((d) => d.open)?.iso ?? null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedByDate, setBookedByDate] = useState<Record<string, Set<string>>>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ date: string; time: string } | null>(null);
  const [form, setForm] = useState<FormData>({ full_name: "", email: "", phone: "", message: "" });

  // Load booked slots across the 15-day window
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingSlots(true);
      const first = days[0].iso;
      const last = days[days.length - 1].iso;
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date, appointment_time")
        .gte("appointment_date", first)
        .lte("appointment_date", last)
        .in("status", ["pending", "confirmed"]);
      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error("Couldn't load availability. Please refresh.");
      } else {
        const map: Record<string, Set<string>> = {};
        for (const row of data ?? []) {
          const t = String(row.appointment_time).slice(0, 8);
          (map[row.appointment_date] ??= new Set()).add(t);
        }
        setBookedByDate(map);
      }
      setLoadingSlots(false);
    }
    load();
    return () => { cancelled = true; };
  }, [days]);

  const slots = useMemo(() => {
    if (!selectedDate) return [] as { time: string; booked: boolean }[];
    const booked = bookedByDate[selectedDate] ?? new Set<string>();
    return slotsForDate(selectedDate).map((t) => ({ time: t, booked: booked.has(t) }));
  }, [selectedDate, bookedByDate]);

  function validate(): string | null {
    if (!form.full_name.trim() || form.full_name.trim().length < 2) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (form.phone.replace(/\D/g, "").length < 7) return "Please enter a valid phone number.";
    if (!selectedDate) return "Please pick a date.";
    if (!selectedTime) return "Please pick a time slot.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim() || null,
      appointment_date: selectedDate!,
      appointment_time: selectedTime!,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("That slot was just taken. Please pick another.");
        setBookedByDate((prev) => ({
          ...prev,
          [selectedDate!]: new Set([...(prev[selectedDate!] ?? []), selectedTime!]),
        }));
        setSelectedTime(null);
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error(error);
      }
      return;
    }
    setBookedByDate((prev) => ({
      ...prev,
      [selectedDate!]: new Set([...(prev[selectedDate!] ?? []), selectedTime!]),
    }));
    setSuccess({ date: selectedDate!, time: selectedTime! });
    setForm({ full_name: "", email: "", phone: "", message: "" });
    setSelectedTime(null);
  }

  if (success) {
    const d = new Date(success.date + "T00:00:00");
    return (
      <div className="card-elevated mx-auto max-w-2xl p-10 text-center animate-fade-up">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="text-2xl font-semibold">Appointment requested</h3>
        <p className="mt-2 text-muted-foreground">
          We'll be in touch shortly to confirm your visit on{" "}
          <span className="font-semibold text-foreground">
            {WEEKDAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()} at {formatTime12(success.time)}
          </span>
          .
        </p>
        <p className="mt-1 text-sm text-muted-foreground">A confirmation has been noted — for anything urgent call {CLINIC.phone}.</p>
        <Button className="mt-6" variant="outline" onClick={() => setSuccess(null)}>
          Book another
        </Button>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
        {/* LEFT: date + time picker */}
        <div className="border-b border-border bg-primary-soft/40 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <CalendarCheck className="h-4 w-4" />
            Step 1 — Pick a date
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {days.map((d) => {
              const isSelected = d.iso === selectedDate;
              return (
                <button
                  key={d.iso}
                  type="button"
                  disabled={!d.open}
                  onClick={() => { setSelectedDate(d.iso); setSelectedTime(null); }}
                  className={cn(
                    "flex flex-col items-center rounded-xl border p-2 text-center transition-all",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    d.open ? "bg-surface-elevated border-border" : "cursor-not-allowed opacity-40",
                    isSelected && "border-primary bg-primary text-primary-foreground shadow-md hover:bg-primary",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                    {WEEKDAYS[d.date.getDay()]}
                  </span>
                  <span className="text-xl font-bold leading-tight">{d.date.getDate()}</span>
                  <span className="text-[10px] opacity-70">{MONTHS[d.date.getMonth()]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <Clock className="h-4 w-4" />
            Step 2 — Pick a time
          </div>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading availability…
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Closed on this day — please pick another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => {
                const isSelected = s.time === selectedTime;
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={s.booked}
                    onClick={() => setSelectedTime(s.time)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                      s.booked
                        ? "cursor-not-allowed border-dashed bg-muted text-muted-foreground line-through opacity-60"
                        : "bg-surface-elevated hover:-translate-y-0.5 hover:border-primary hover:shadow-sm",
                      isSelected && !s.booked && "border-primary bg-primary text-primary-foreground shadow-md hover:bg-primary",
                    )}
                  >
                    {formatTime12(s.time)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: form */}
        <form onSubmit={onSubmit} className="space-y-4 p-6 sm:p-8">
          <div className="mb-2">
            <h3 className="text-xl font-semibold">Your details</h3>
            <p className="text-sm text-muted-foreground">We'll only use this to confirm your visit.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name *</Label>
            <Input id="full_name" required maxLength={100} value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Jane Doe" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required maxLength={200} value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" required maxLength={30} value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-1234" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" rows={3} maxLength={500} value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Anything we should know before your visit?" />
          </div>
          <div className="rounded-lg bg-primary-soft/50 px-4 py-3 text-sm">
            <div className="text-muted-foreground">Selected slot</div>
            <div className="font-semibold text-foreground">
              {selectedDate
                ? `${new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`
                : "No date selected"}
              {selectedTime && ` · ${formatTime12(selectedTime)}`}
            </div>
          </div>
          <Button type="submit" size="lg" variant="coral" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking…</> : "Confirm appointment"}
          </Button>
        </form>
      </div>
    </div>
  );
}
