import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-dental.jpg";
import {
  Phone, ShieldCheck, Award, Clock, HeartHandshake, Star, MapPin, Mail,
  Sparkles, Stethoscope, Smile, Wrench, Baby, Zap, ArrowRight, ChevronDown,
  Facebook, Instagram, Twitter, PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { BookingForm } from "@/components/booking-form";
import { CLINIC, formatHoursDisplay } from "@/lib/clinic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Changez Khan Dental — Gentle, Modern Dentistry" },
      { name: "description", content: "Trusted family dental care: cleanings, implants, orthodontics, cosmetic and emergency dentistry. Book online in seconds." },
      { property: "og:title", content: "Changez Khan Dental — Gentle, Modern Dentistry" },
      { property: "og:description", content: "Trusted family dental care: cleanings, implants, orthodontics, cosmetic and emergency dentistry. Book online in seconds." },
    ],
  }),
  component: HomePage,
});

const SERVICES = [
  { icon: Stethoscope, title: "General Dentistry", desc: "Comprehensive check-ups, fillings, and preventive care that keep smiles healthy for life." },
  { icon: Sparkles, title: "Teeth Cleaning", desc: "Gentle scaling and polishing to leave your teeth genuinely fresh and cavity-free." },
  { icon: Wrench, title: "Dental Implants", desc: "Permanent tooth replacements that look, feel, and function just like natural teeth." },
  { icon: Baby, title: "Orthodontics", desc: "Clear aligners and modern braces designed to align your smile without disrupting life." },
  { icon: Smile, title: "Cosmetic Dentistry", desc: "Veneers and smile makeovers crafted around your face and personality." },
  { icon: Zap, title: "Teeth Whitening", desc: "Professional whitening that safely brightens your smile several shades in one visit." },
];

const TRUST = [
  { icon: Award, label: "20+ Years", sub: "Experienced Dentists" },
  { icon: ShieldCheck, label: "Modern", sub: "Digital Equipment" },
  { icon: HeartHandshake, label: "Emergency", sub: "Same-Day Care" },
  { icon: Star, label: "4.9 / 5", sub: "600+ Happy Patients" },
];

const REVIEWS = [
  { name: "Amelia R.", rating: 5, text: "The kindest dental team I've ever met. My kids actually ask when we're going back — that says everything." },
  { name: "Marcus T.", rating: 5, text: "Dr. Khan replaced two implants that another clinic messed up. Painless, professional, and honest pricing." },
  { name: "Priya S.", rating: 5, text: "Booked online at 11pm, seen the next morning for an emergency. Clean modern office and zero waiting around." },
  { name: "Jordan L.", rating: 5, text: "Best whitening I've had. They explained every step and my teeth look natural, not overdone. Highly recommend." },
];

const FAQ = [
  { q: "Do you accept new patients?", a: "Yes — we're actively welcoming new patients of all ages. Book any available slot and we'll take it from there." },
  { q: "Which insurances do you accept?", a: "We work with most major PPO plans. Bring your card to your first visit and our team will confirm your coverage in minutes." },
  { q: "What if I have a dental emergency?", a: `Call us on ${CLINIC.emergencyPhone} — we hold same-day slots for emergencies during opening hours and offer after-hours triage.` },
  { q: "How early should I arrive?", a: "10 minutes before your appointment is perfect for a first visit; 5 minutes is plenty after that." },
  { q: "Do you treat children?", a: "Absolutely. Our team is trained in pediatric care and our chairs come with headphones and screens to keep little ones relaxed." },
  { q: "Is financing available?", a: "Yes. We offer 0% payment plans on treatments over $500 through our financing partner — ask us at your visit." },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative gradient-hero overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="flex flex-col justify-center animate-fade-up">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-surface-elevated px-3 py-1 text-xs font-medium text-primary shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Accepting new patients this week
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Confident smiles begin with <span className="text-gradient-primary">gentle, honest care</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              At {CLINIC.name} we combine 20 years of experience with modern digital dentistry — so every visit
              is comfortable, transparent, and unrushed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="coral" size="lg" className="rounded-full px-8" onClick={() => document.getElementById("booking-form-anchor")?.scrollIntoView({ behavior: "smooth" })}>
                Book Appointment <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                <a href={`tel:${CLINIC.phone}`}><Phone className="h-4 w-4" /> Call Now</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUST.map((t) => (
                <div key={t.sub} className="rounded-2xl border border-border bg-surface-elevated/60 p-3 backdrop-blur-sm">
                  <t.icon className="h-5 w-5 text-primary" />
                  <div className="mt-2 text-sm font-bold">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
              <img src={heroImg} alt="Friendly dentist welcoming a patient in a modern clinic" width={1600} height={1200} className="h-full w-full object-cover aspect-[4/3]" />
            </div>
            <div className="absolute -bottom-6 left-6 hidden max-w-[240px] rounded-2xl border border-border bg-surface-elevated p-4 shadow-lg sm:block animate-float">
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <div className="mt-1 text-xs font-semibold">Rated 4.9 by 600+ patients</div>
              <div className="text-[11px] text-muted-foreground">Verified reviews on Google</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Our Services</div>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Everything your smile needs, under one roof</h2>
            <p className="mt-4 text-muted-foreground">From routine care to full smile makeovers — delivered with the same gentle standard.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <div key={s.title} className="group card-elevated relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary-soft opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-md">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:gap-2">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="schedule" className="section-padding bg-primary-soft/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Visit Us</div>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Open when you need us</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Our doors are open six days a week, with early and late slots to fit around real schedules.
            </p>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold text-foreground">Emergency dental care</div>
                <div className="text-sm text-muted-foreground">Same-day appointments may be available for urgent issues. Call {CLINIC.emergencyPhone}.</div>
              </div>
            </div>
          </div>
          <div className="card-elevated p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground"><Clock className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Operating hours</div>
                <div className="text-sm text-muted-foreground">All times local</div>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {formatHoursDisplay().map((h) => (
                <li key={h.label} className="flex items-center justify-between py-3">
                  <span className="font-medium">{h.label}</span>
                  <span className={cn("text-sm", h.value === "Closed" ? "font-semibold text-accent" : "text-muted-foreground")}>{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Reviews</div>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Trusted by Local Families</h2>
            <p className="mt-4 text-muted-foreground">Real words from real neighbours — because trust is earned one visit at a time.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="card-elevated flex flex-col p-6">
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">"{r.text}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-primary-foreground font-semibold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">Verified patient</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href={CLINIC.googleReviewsUrl}
              target="_blank" rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary-soft/60 px-6 py-3 text-sm font-semibold text-primary transition-all hover:border-primary hover:shadow-md"
            >
              See All Reviews on Google
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking-form-anchor" className="section-padding bg-gradient-to-b from-primary-soft/40 to-background scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Book Appointment</div>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">Reserve your visit in under a minute</h2>
            <p className="mt-4 text-muted-foreground">Pick any available slot in the next 15 days — we'll confirm by phone or email.</p>
          </div>
          <div className="mt-12">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</div>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Come say hi</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              { icon: MapPin, title: "Visit", body: CLINIC.address },
              { icon: Phone, title: "Call", body: CLINIC.phone, href: `tel:${CLINIC.phone}` },
              { icon: Mail, title: "Email", body: CLINIC.email, href: `mailto:${CLINIC.email}` },
            ].map((c) => (
              <a key={c.title} href={c.href ?? "#"} className="card-elevated group flex items-start gap-4 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</div>
                  <div className="mt-1 text-base font-medium">{c.body}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="card-elevated aspect-[16/9] overflow-hidden">
              <iframe
                title="Clinic location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(CLINIC.address)}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
            <div className="card-elevated flex flex-col justify-between p-6 gradient-coral text-accent-foreground">
              <div>
                <PhoneCall className="h-8 w-8" />
                <h3 className="mt-4 text-xl font-semibold">Dental emergency?</h3>
                <p className="mt-2 text-sm opacity-90">Chipped tooth, sudden pain, knocked-out filling? Don't wait.</p>
              </div>
              <a href={`tel:${CLINIC.emergencyPhone}`} className="mt-6 inline-flex items-center justify-center rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-accent hover:bg-white">
                Call {CLINIC.emergencyPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding bg-primary-soft/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</div>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Questions, answered</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background/90">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary"><Sparkles className="h-5 w-5" /></div>
              <div className="font-display text-lg font-bold text-background">{CLINIC.name}</div>
            </div>
            <p className="mt-4 max-w-xs text-sm opacity-70">Gentle, modern dental care for the whole family. Building healthier smiles since 2004.</p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-background/20 transition-colors hover:bg-background hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-background">Quick links</div>
            <ul className="mt-4 space-y-2 text-sm opacity-80">
              {["home", "services", "schedule", "reviews", "contact"].map((id) => (
                <li key={id}>
                  <button className="capitalize hover:text-background" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}>{id}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-background">Contact</div>
            <ul className="mt-4 space-y-2 text-sm opacity-80">
              <li>{CLINIC.address}</li>
              <li><a href={`tel:${CLINIC.phone}`} className="hover:text-background">{CLINIC.phone}</a></li>
              <li><a href={`mailto:${CLINIC.email}`} className="hover:text-background">{CLINIC.email}</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-background">Emergency</div>
            <p className="mt-4 text-sm opacity-80">24/7 triage available for urgent dental issues.</p>
            <a href={`tel:${CLINIC.emergencyPhone}`} className="mt-3 inline-flex items-center gap-2 rounded-full gradient-coral px-4 py-2 text-sm font-semibold text-accent-foreground">
              <Phone className="h-4 w-4" /> {CLINIC.emergencyPhone}
            </a>
          </div>
        </div>
        <div className="border-t border-background/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs opacity-60 sm:flex-row sm:px-6 lg:px-8">
            <div>© {new Date().getFullYear()} {CLINIC.name}. All rights reserved.</div>
            <a href="/admin" className="hover:opacity-100">Staff portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("card-elevated overflow-hidden transition-colors", open && "border-primary/40")}>
      <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="font-semibold">{q}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180 text-primary")} />
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground animate-fade-up">{a}</div>}
    </div>
  );
}
