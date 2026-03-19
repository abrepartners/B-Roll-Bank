import { BuilderSection } from "@/components/builder-section"
import { GallerySection } from "@/components/gallery-section"
import { HeroSection } from "@/components/hero-section"
import { OffersSection } from "@/components/offers-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { WhyChooseSection } from "@/components/why-choose-section"

const navLinks = [
  { href: "#why-choose", label: "Why Us" },
  { href: "#offers", label: "Offers" },
  { href: "#gallery", label: "Gallery" },
  { href: "#reviews", label: "Reviews" },
  { href: "#builders", label: "Builders" },
]

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-stone-dark/75 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <a href="#" className="font-serif text-lg font-bold text-white">
            Countertop World
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium uppercase tracking-wider text-white/70 transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#lead-form"
            className="inline-flex items-center rounded-sm border border-gold/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-foreground"
          >
            Get Quote
          </a>
        </div>
      </header>

      <main>
        <HeroSection />
        <WhyChooseSection />
        <OffersSection />
        <GallerySection />
        <SocialProofSection />
        <BuilderSection />

        <section id="lead-form" className="bg-secondary py-20 md:py-28">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-start">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gold">
                Enter Giveaway
              </p>
              <h2 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Claim Your Home Show Offer
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Fill out this short form and our team will reach out with pricing,
                availability, and your giveaway entry confirmation.
              </p>
              <div className="mt-8 rounded-sm border border-border bg-background p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Prefer to talk now?
                </p>
                <a
                  href="tel:+14794731053"
                  className="mt-2 block font-serif text-2xl font-bold text-foreground hover:text-gold"
                >
                  (479) 473-1053
                </a>
              </div>
            </div>

            <form className="rounded-sm border border-border bg-background p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    First Name
                  </span>
                  <input
                    name="firstName"
                    required
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none ring-gold/60 transition focus-visible:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Name
                  </span>
                  <input
                    name="lastName"
                    required
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none ring-gold/60 transition focus-visible:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none ring-gold/60 transition focus-visible:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none ring-gold/60 transition focus-visible:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Project Type
                  </span>
                  <select
                    name="projectType"
                    defaultValue=""
                    required
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none ring-gold/60 transition focus-visible:ring-2"
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    <option value="kitchen-remodel">Kitchen Remodel</option>
                    <option value="bath-remodel">Bathroom Remodel</option>
                    <option value="new-construction">New Construction</option>
                    <option value="commercial">Commercial / Multi-Unit</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Notes
                  </span>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Tell us about your project timeline and location."
                    className="rounded-sm border border-input bg-background px-3 py-3 text-sm outline-none ring-gold/60 transition focus-visible:ring-2"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-gold-light"
              >
                Submit Entry
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                By submitting, you agree to be contacted by Countertop World.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Countertop World • Arkansas</p>
          <p>© {new Date().getFullYear()} Countertop World. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
