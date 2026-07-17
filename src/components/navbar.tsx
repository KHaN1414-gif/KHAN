import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLINIC } from "@/lib/clinic";

const NAV = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "schedule", label: "Schedule" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  function goTo(id: string, e?: MouseEvent) {
    // Prevent the native "#id" jump so we can do our own smooth scroll,
    // but only once React has actually hydrated and attached this handler.
    e?.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBook(e?: MouseEvent) {
    e?.preventDefault();
    setOpen(false);
    const form = document.getElementById("booking-form-anchor");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "border-b border-border/60 bg-background/85 backdrop-blur-lg shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-md transition-transform group-hover:rotate-6">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-base font-bold">{CLINIC.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dental Care</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => goTo(n.id, e)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === n.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {n.label}
              {active === n.id && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full gradient-primary" />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="coral" size="lg" className="hidden sm:inline-flex rounded-full px-6" asChild>
            <a href="#booking-form-anchor" onClick={goBook}>Book Appointment</a>
          </Button>
          <button
            className="md:hidden grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-elevated"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={(e) => goTo(n.id, e)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm font-medium",
                  active === n.id ? "bg-primary-soft text-primary" : "hover:bg-muted",
                )}
              >
                {n.label}
              </a>
            ))}
            <Button variant="coral" className="mt-2 w-full" asChild>
              <a href="#booking-form-anchor" onClick={goBook}>Book Appointment</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
