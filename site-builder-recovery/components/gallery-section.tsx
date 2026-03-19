"use client"

import { useState } from "react"
import Image from "next/image"

const galleryItems = [
  {
    src: "/images/kitchen-after.jpg",
    alt: "After: Modern white quartz kitchen remodel",
    label: "After",
    category: "Kitchen",
    description: "White Quartz — Fort Smith, AR",
  },
  {
    src: "/images/kitchen-before.jpg",
    alt: "Before: Outdated kitchen ready for renovation",
    label: "Before",
    category: "Kitchen",
    description: "Before Remodel",
  },
  {
    src: "/images/bathroom-countertop.jpg",
    alt: "Luxury bathroom vanity with Calacatta marble countertop",
    label: null,
    category: "Bath",
    description: "Calacatta Marble — Little Rock, AR",
  },
  {
    src: "/images/kitchen-island.jpg",
    alt: "Kitchen island with grey waterfall quartz countertop",
    label: null,
    category: "Kitchen",
    description: "Grey Quartz Waterfall — Fayetteville, AR",
  },
  {
    src: "/images/stone-closeup.jpg",
    alt: "Close-up of marble countertop veining and edge detail",
    label: null,
    category: "Detail",
    description: "Statuario Marble Edge Detail",
  },
  {
    src: "/images/edge-profile.jpg",
    alt: "Ogee edge profile on black granite countertop",
    label: null,
    category: "Detail",
    description: "Ogee Edge — Black Galaxy Granite",
  },
]

const filters = ["All", "Kitchen", "Bath", "Detail"]

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = galleryItems.filter(
    (item) => activeFilter === "All" || item.category === activeFilter
  )

  return (
    <section id="gallery" className="bg-secondary py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-gold uppercase tracking-widest text-xs font-medium font-sans mb-3">
              Our Work
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              Craftsmanship That
              <br />
              Speaks for Itself
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm border transition-colors duration-150 font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                  activeFilter === f
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((item, i) => (
            <div
              key={item.src}
              className={`group relative overflow-hidden rounded-sm ${
                i === 0 && activeFilter === "All" ? "col-span-2 md:col-span-1 row-span-2 md:row-span-1 aspect-[4/3]" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-stone-dark/0 group-hover:bg-stone-dark/50 transition-colors duration-300" />

              {/* Label badge */}
              {item.label && (
                <span className={`absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium font-sans px-2.5 py-1 rounded-sm ${
                  item.label === "After" ? "bg-gold text-foreground" : "bg-stone-mid/80 text-white"
                }`}>
                  {item.label}
                </span>
              )}

              {/* Description overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white font-sans text-sm font-medium">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
