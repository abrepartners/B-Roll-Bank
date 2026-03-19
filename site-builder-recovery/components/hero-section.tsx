"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

// Home show date — set to ~3 weeks from now for demo urgency
const HOME_SHOW_DATE = new Date("2026-03-14T09:00:00")

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-stone-dark text-primary-foreground font-serif text-3xl md:text-5xl font-bold w-16 md:w-20 h-16 md:h-20 flex items-center justify-center rounded-sm border border-gold/30 tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[10px] md:text-xs uppercase tracking-widest text-gold font-sans font-medium">
        {label}
      </span>
    </div>
  )
}

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const calc = () => {
      const now = Date.now()
      const diff = HOME_SHOW_DATE.getTime() - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    intervalRef.current = setInterval(calc, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-kitchen.jpg"
          alt="Luxury kitchen with marble countertops by Countertop World"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-stone-dark/70" />
        {/* Subtle bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-dark/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 md:py-32 lg:py-40">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-gold/60 bg-stone-dark/50 backdrop-blur-sm text-gold text-xs uppercase tracking-widest font-medium px-4 py-2 rounded-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Arkansas Home Show — Limited Time Offer
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-balance max-w-4xl">
          Win Up to{" "}
          <span className="text-gold">$1,000</span>
          <br />
          Toward Your New
          <br />
          Countertops
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed max-w-xl font-sans">
          Enter our Home Show Giveaway and transform your kitchen or bath with
          Arkansas&apos; trusted countertop experts.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="#lead-form"
            className="inline-flex items-center justify-center gap-2 bg-gold text-foreground font-sans font-semibold text-base px-8 py-4 rounded-sm hover:bg-gold-light transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            Enter to Win
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a
            href="#lead-form"
            className="inline-flex items-center justify-center border border-white/60 text-white font-sans font-semibold text-base px-8 py-4 rounded-sm hover:bg-white/10 transition-colors duration-200"
          >
            Request a Free Quote
          </a>
        </div>

        {/* Countdown */}
        <div className="mt-14">
          <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4 font-sans">
            Home Show Starts In
          </p>
          <div className="flex items-start gap-3 md:gap-5">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <div className="text-gold text-3xl md:text-5xl font-bold mt-2 md:mt-3 leading-none select-none">:</div>
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <div className="text-gold text-3xl md:text-5xl font-bold mt-2 md:mt-3 leading-none select-none">:</div>
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
            <div className="text-gold text-3xl md:text-5xl font-bold mt-2 md:mt-3 leading-none select-none">:</div>
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-14 flex flex-wrap gap-6 md:gap-10">
          {[
            { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", label: "1,000+ Installs" },
            { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", label: "2 Arkansas Locations" },
            { icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", label: "5-Star Rated" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              <span className="text-white/80 text-sm font-sans">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/30">
        <span className="text-[10px] uppercase tracking-widest font-sans">Scroll</span>
        <div className="w-px h-8 bg-white/20 animate-pulse" />
      </div>
    </section>
  )
}
