import Image from "next/image"

const stats = [
  { value: "1,000+", label: "Successful Installations" },
  { value: "2", label: "Arkansas Locations" },
  { value: "5★", label: "Average Google Rating" },
  { value: "15+", label: "Years of Expertise" },
]

const pillars = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Local Arkansas Experts",
    description: "Family-owned and operated, we know this state's homes, builders, and climate. We're not a big-box operation — we're your neighbors.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "Fast Turnaround",
    description: "We respect your timeline. From templating to final install, we move with purpose so your project stays on schedule.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: "Exceptional Craftsmanship",
    description: "Every edge. Every seam. Every cutout. Our fabricators treat your stone like a work of art, because it is.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: "We Serve Homeowners & Builders",
    description: "Whether you're remodeling a single kitchen or managing 50 new builds, we have the capacity, consistency, and communication you need.",
  },
]

export function WhyChooseSection() {
  return (
    <section id="why-choose" className="bg-secondary py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-gold uppercase tracking-widest text-xs font-medium font-sans mb-3">
              Why Countertop World
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              Arkansas&apos; Most Trusted
              <br />
              Countertop Specialists
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-sm font-sans text-sm md:text-base">
            We show up on time and deliver flawless results — every single project.
            That&apos;s not a promise. It&apos;s our record.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-sm overflow-hidden mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-background px-6 py-8 flex flex-col items-center text-center">
              <span className="font-serif text-3xl md:text-4xl font-bold text-foreground">{stat.value}</span>
              <span className="mt-1 text-muted-foreground text-xs md:text-sm uppercase tracking-wider font-sans">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex gap-5">
              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-background border border-border rounded-sm text-gold">
                {pillar.icon}
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Image strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
            <Image src="/images/stone-closeup.jpg" alt="Premium marble stone veining close-up" fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
            <Image src="/images/fabrication.jpg" alt="Stone fabrication craftsman at work" fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden col-span-2 md:col-span-1">
            <Image src="/images/edge-profile.jpg" alt="Precision stone edge profile detail" fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </section>
  )
}
