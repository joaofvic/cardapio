
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/app/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

export function SpotlightSection() {
  const spotlightImg = PlaceHolderImages.find(img => img.id === 'hero-spotlight')?.imageUrl || '';

  return (
    <section className="relative w-full aspect-[2/1] min-h-[300px] overflow-hidden rounded-3xl mb-10 shadow-2xl group">
      <Image
        src={spotlightImg}
        alt="Harvest Performance Bundle"
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-105"
        priority
        data-ai-hint="meal prep bundle"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
        <Badge className="bg-secondary text-secondary-foreground mb-4 font-bold border-none uppercase tracking-widest text-xs px-3 py-1">
          Seasonal Spotlight
        </Badge>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-none">
          THE HARVEST PERFORMANCE BUNDLE
        </h1>
        <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
          Power your peak performance with our chef-curated selection of high-protein, clean-eating meals. Perfectly balanced for the new season.
        </p>
        <div className="flex gap-4">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-full shadow-lg transition-all hover:translate-y-[-2px]">
            View Bundle
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold h-12 px-8 rounded-full backdrop-blur-sm">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
