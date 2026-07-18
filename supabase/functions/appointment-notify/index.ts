// Supabase Edge Function: appointment-notify
//
// Fires the moment a new appointment is booked (bookings are auto-confirmed now,
// there's no separate "staff confirms it" step anymore).
// Sends WhatsApp always (phone is required on the form), and email only if the
// client actually gave one. No SMS -- WhatsApp only, per the clinic's choice,
// since paying per SMS into Pakistani networks isn't worth it for this client.
//
// If a number simply isn't on WhatsApp, Twilio's send will fail -- we log it and
// move on. There's no reliable free way to check in advance, so we just try, and
// if it doesn't land, nothing else happens (no SMS fallback).
//
// Required secrets (Project Settings -> Edge Functions -> Secrets):
//   RESEND_API_KEY        - from resend.com
//   RESEND_FROM           - e.g. "Changez Khan Dental <appointments@yourdomain.com>"
//   TWILIO_ACCOUNT_SID    - from twilio.com console
//   TWILIO_AUTH_TOKEN     - from twilio.com console
//   TWILIO_WHATSAPP_FROM  - your Twilio WhatsApp sender, e.g. "+14155238886" (sandbox default)
//   CLINIC_PHONE          - e.g. "(555) 123-4567"
//   CLINIC_ADDRESS        - e.g. "24 Willow Avenue, Suite 300, Springfield"

const CLINIC_NAME = "Changez Khan Dental";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return { day: WEEKDAYS[d.getDay()], date: `${MONTHS[d.getMonth()]} ${d.getDate()}` };
}

function formatTime(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

// Same wording everywhere -- four short lines, no offer to reschedule, just the facts and a thank you.
function buildMessage(name: string, day: string, date: string, time: string) {
  return (
`Hi ${name},

Your appointment with ${CLINIC_NAME} is confirmed for ${day}, ${date} at ${time}.

We're glad to have you with us and look forward to taking good care of you.

Thank you for choosing us.`
  );
}

async function sendEmail(to: string, subject: string, body: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM");
  if (!apiKey || !from) { console.log("Resend not configured, skipping email"); return; }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text: body }),
  });
  if (!res.ok) console.log("Resend error:", res.status, await res.text());
}

// Twilio needs full international format (e.g. +923001234567). Patients type local
// formats like "0300 1234567" -- this converts Pakistani numbers automatically.
// Adjust the country code here if you're not in PK.
function toE164Pakistan(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  return `+92${digits}`;
}

async function sendWhatsApp(to: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_FROM");
  if (!sid || !token || !fromNumber) { console.log("Twilio WhatsApp not configured, skipping"); return; }

  const params = new URLSearchParams({
    From: `whatsapp:${fromNumber}`,
    To: `whatsapp:${toE164Pakistan(to)}`,
    Body: body,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  // If this number isn't on WhatsApp (or hasn't joined the sandbox), Twilio returns
  // an error here. We just log it and move on -- no SMS fallback, as agreed.
  if (!res.ok) console.log("WhatsApp send failed (number may not be on WhatsApp):", res.status, await res.text());
}

Deno.serve(async (req) => {
  const payload = await req.json();
  const { type, record } = payload;

  // Fires on every new booking -- they're created already confirmed.
  if (type !== "INSERT" || record?.status !== "confirmed") {
    return new Response("ignored", { status: 200 });
  }

  const { day, date } = formatDate(record.appointment_date);
  const time = formatTime(String(record.appointment_time).slice(0, 5));
  const name = record.full_name as string;
  const message = buildMessage(name, day, date, time);

  const jobs: Promise<void>[] = [sendWhatsApp(record.phone, message)];
  if (record.email) {
    jobs.push(sendEmail(record.email, `Your appointment is confirmed -- ${day}, ${date} at ${time}`, message));
  }

  await Promise.allSettled(jobs);
  return new Response("sent", { status: 200 });
});
