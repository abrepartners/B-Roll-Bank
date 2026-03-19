const offers = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M8 9V7a4 4 0 018 0v2"/>
      </svg>
    ),
    tag: "Free With Purchase",
    title: "Free Sink Upgrade",
    description: "Receive a premium undermount sink with any countertop purchase made at the Home Show — a $300+ value.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    tag: "Included Free",
    title: "Free 15-Year Sealer Upgrade",
    description: "Every Home Show purchase includes our premium 15-year sealer application — protect your investment from day one.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      </svg>
    ),
    tag: "Limited Time",
    title: "Exclusive Home Show Pricing",
    description: "Special show-floor pricing on quartz, granite, and marble — only available to attendees. Don't miss your chance.",
  },
]

export function OffersSection() {
  return (
    <section id="offers" className="bg-background py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-gold uppercase tracking-widest text-xs font-medium font-sans mb-3">
            Exclusive Home Show Offers
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            Three Reasons to Visit
            <br />
            Our Booth
          </h2>
          <p className="mt-4 text-muted-foreground font-sans text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            These deals are only available for a limited time at the Home Show.
            Stop by, see our full stone gallery, and walk away with exclusive savings.
          </p>
        </div>

        {/* Offer cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, i) => (
            <div
              key={offer.title}
              className={`relative flex flex-col p-8 rounded-sm border transition-shadow hover:shadow-lg ${
                i === 1
                  ? "bg-stone-dark text-white border-gold/40"
                  : "bg-secondary border-border"
              }`}
            >
              {/* Tag */}
              <span className={`inline-block text-[10px] uppercase tracking-widest font-medium font-sans px-3 py-1 rounded-full mb-5 self-start ${
                i === 1 ? "bg-gold text-foreground" : "bg-gold/10 text-gold border border-gold/30"
              }`}>
                {offer.tag}
              </span>

              {/* Icon */}
              <div className={`mb-5 ${i === 1 ? "text-gold" : "text-gold"}`}>
                {offer.icon}
              </div>

              <h3 className={`font-serif text-xl font-semibold mb-3 ${i === 1 ? "text-white" : "text-foreground"}`}>
                {offer.title}
              </h3>
              <p className={`text-sm leading-relaxed font-sans flex-1 ${i === 1 ? "text-white/70" : "text-muted-foreground"}`}>
                {offer.description}
              </p>

              {/* Divider */}
              <div className={`my-6 h-px ${i === 1 ? "bg-white/10" : "bg-border"}`} />

              <a
                href="#lead-form"
                className={`inline-flex items-center gap-2 text-sm font-medium font-sans transition-colors ${
                  i === 1
                    ? "text-gold hover:text-gold-light"
                    : "text-foreground hover:text-gold"
                }`}
              >
                Claim Your Offer
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
