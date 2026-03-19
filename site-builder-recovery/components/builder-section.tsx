import Image from "next/image"

const features = [
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    text: "On-time installs, every time",
  },
  {
    icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
    text: "Consistent stone quality and precision fabrication",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    text: "Communication you can count on",
  },
  {
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
    text: "Dedicated trade pricing and support",
  },
]

export function BuilderSection() {
  return (
    <section id="builders" className="bg-stone-dark py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — image */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
              <Image
                src="/images/kitchen-island.jpg"
                alt="Custom kitchen island with waterfall quartz countertop"
                fill
                className="object-cover"
              />
              {/* Gold accent frame */}
              <div className="absolute inset-0 border border-gold/20 rounded-sm pointer-events-none" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-4 md:-right-8 bg-gold text-foreground px-6 py-4 rounded-sm shadow-xl">
              <p className="font-serif text-2xl font-bold leading-none">1,000+</p>
              <p className="font-sans text-xs font-medium mt-1 uppercase tracking-wide">Builds Completed</p>
            </div>
          </div>

          {/* Right — content */}
          <div>
            <p className="text-gold uppercase tracking-widest text-xs font-medium font-sans mb-4">
              For Builders & Contractors
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight text-balance mb-6">
              Your New Favorite
              <br />
              Fabrication Partner
            </h2>
            <p className="text-white/70 leading-relaxed font-sans text-base mb-10">
              Building multiple units? Managing tight schedules? We become an extension
              of your team — delivering premium stone work that keeps your subs moving
              and your clients impressed.
            </p>

            {/* Feature list */}
            <ul className="space-y-5 mb-10" role="list">
              {features.map((f) => (
                <li key={f.text} className="flex items-start gap-4">
                  <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-sm bg-white/5 border border-gold/20 text-gold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={f.icon} />
                    </svg>
                  </div>
                  <span className="text-white/85 font-sans text-sm leading-relaxed pt-1.5">{f.text}</span>
                </li>
              ))}
            </ul>

            <a
              href="#lead-form"
              className="inline-flex items-center gap-2 bg-gold text-foreground font-sans font-semibold text-base px-8 py-4 rounded-sm hover:bg-gold-light transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              {"Let's Connect"}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
