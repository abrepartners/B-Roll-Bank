const reviews = [
  {
    name: "Sarah M.",
    location: "Little Rock, AR",
    stars: 5,
    text: "Countertop World absolutely exceeded our expectations. The team was on time, professional, and the quartz countertops look stunning. Our kitchen feels like a brand new space.",
    type: "homeowner",
  },
  {
    name: "Jake T.",
    location: "Fort Smith, AR",
    stars: 5,
    text: "As a custom home builder, I need a fab partner I can count on. Countertop World delivers consistently — perfect seams, on schedule, every single time. My clients love the results.",
    type: "builder",
  },
  {
    name: "Linda R.",
    location: "Bentonville, AR",
    stars: 5,
    text: "From the moment we walked into the showroom, we felt taken care of. The communication was incredible and our bathroom vanity turned out absolutely beautiful.",
    type: "homeowner",
  },
  {
    name: "Marcus D.",
    location: "Fayetteville, AR",
    stars: 5,
    text: "We build 40-50 homes a year and Countertop World handles our entire countertop program. Their trade pricing, quality, and reliability is unmatched in this market.",
    type: "builder",
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gold" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export function SocialProofSection() {
  return (
    <section id="reviews" className="bg-background py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-gold uppercase tracking-widest text-xs font-medium font-sans mb-3">
            What Our Customers Say
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            Real Results. Real People.
          </h2>
          {/* Google rating badge */}
          <div className="mt-6 inline-flex items-center gap-3 border border-border rounded-sm px-5 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Google" role="img">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div className="flex items-center gap-2">
              <StarRating count={5} />
              <span className="font-sans text-sm font-semibold text-foreground">4.9</span>
              <span className="text-muted-foreground text-sm font-sans">· 200+ Google Reviews</span>
            </div>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {reviews.map((review) => (
            <div key={review.name} className="bg-secondary border border-border rounded-sm p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-sans font-semibold text-foreground text-sm">{review.name}</p>
                  <p className="text-muted-foreground text-xs font-sans mt-0.5">{review.location}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-medium font-sans px-2.5 py-1 rounded-full border ${
                  review.type === "builder"
                    ? "border-gold/40 text-gold bg-gold/5"
                    : "border-border text-muted-foreground"
                }`}>
                  {review.type === "builder" ? "Builder" : "Homeowner"}
                </span>
              </div>
              <StarRating count={review.stars} />
              <p className="text-foreground font-sans text-sm leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Video placeholder */}
        <div className="relative rounded-sm overflow-hidden bg-stone-dark flex items-center justify-center min-h-[300px] md:min-h-[400px] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-dark to-stone-mid" />
          <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
            {/* Play button */}
            <button
              aria-label="Play customer video testimonial"
              className="w-18 h-18 w-20 h-20 flex items-center justify-center rounded-full bg-gold text-foreground hover:bg-gold-light transition-colors duration-200 shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
            <div>
              <p className="font-serif text-xl font-bold text-white">Hear From Our Customers</p>
              <p className="text-white/50 text-sm font-sans mt-1">Real homeowners and builders share their experience</p>
            </div>
          </div>
          {/* Corner labels */}
          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-medium font-sans text-white/40">
            Video Testimonial
          </span>
        </div>
      </div>
    </section>
  )
}
