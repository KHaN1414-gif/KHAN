// Clinic configuration — single source of truth for hours, contact, branding.
export const CLINIC = {
  name: "Changez Khan Dental",
  tagline: "Trusted Family Dentistry",
  phone: "(555) 123-4567",
  emergencyPhone: "(555) 999-0000",
  email: "hello@changezkhandental.com",
  address: "24 Willow Avenue, Suite 300, Springfield",
  googleReviewsUrl: "https://www.google.com/search?q=changez+khan+dental+reviews",
  socials: {
    instagram: "#",
    facebook: "#",
    twitter: "#",
  },
} as const;

// Operating hours by JS day (0=Sun ... 6=Sat). null = closed.
// 24h times.
export const HOURS: Record<number, { open: string; close: string } | null> = {
  0: null, // Sunday
  1: { open: "09:00", close: "18:00" },
  2: { open: "09:00", close: "18:00" },
  3: { open: "09:00", close: "18:00" },
  4: { open: "09:00", close: "18:00" },
  5: { open: "09:00", close: "18:00" },
  6: { open: "10:00", close: "15:00" }, // Saturday
};

export const SLOT_MINUTES = 30;
export const BOOKING_HORIZON_DAYS = 15;

export function formatHoursDisplay() {
  return [
    { label: "Monday – Friday", value: "9:00 AM – 6:00 PM" },
    { label: "Saturday", value: "10:00 AM – 3:00 PM" },
    { label: "Sunday", value: "Closed" },
  ];
}

// Generate all slot start times for a given date (YYYY-MM-DD). Returns [] if closed.
export function slotsForDate(dateISO: string): string[] {
  const d = new Date(dateISO + "T00:00:00");
  const hours = HOURS[d.getDay()];
  if (!hours) return [];
  const [oh, om] = hours.open.split(":").map(Number);
  const [ch, cm] = hours.close.split(":").map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  const slots: string[] = [];
  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
  }
  return slots;
}

export function formatTime12(t: string): string {
  const [hh, mm] = t.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

export function toDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function next15Days(): { iso: string; date: Date; open: boolean }[] {
  const out: { iso: string; date: Date; open: boolean }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < BOOKING_HORIZON_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ iso: toDateISO(d), date: d, open: HOURS[d.getDay()] !== null });
  }
  return out;
}
