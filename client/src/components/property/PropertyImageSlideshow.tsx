'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Property } from '@/src/types/property';

export interface SlideshowImage {
  id: string;
  public_url: string;
}

/** Prefer room photos (all units); fall back to property-level images. */
export function collectPropertySlideshowImages(
  property: Property,
): SlideshowImage[] {
  const roomImages = (property.rooms ?? []).flatMap(
    (room) => room.images ?? [],
  );

  if (roomImages.length > 0) {
    return roomImages.map((image) => ({
      id: image.id,
      public_url: image.public_url,
    }));
  }

  return (property.images ?? []).map((image) => ({
    id: image.id,
    public_url: image.public_url,
  }));
}

interface PropertyImageSlideshowProps {
  images: SlideshowImage[];
  alt: string;
  intervalMs?: number;
  sizes: string;
  className?: string;
  showDots?: boolean;
}

export default function PropertyImageSlideshow({
  images,
  alt,
  intervalMs = 3500,
  sizes,
  className,
  showDots = true,
}: PropertyImageSlideshowProps) {
  const slides = useMemo(
    () => images.filter((image) => Boolean(image.public_url)),
    [images],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [slides, paused, intervalMs]);

  if (slides.length === 0) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#4b6a8a] via-[#5b7f9d] to-[#8eb4c9] ${className ?? ''}`}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 ${className ?? ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            slideIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={slideIndex !== index}
        >
          <Image
            src={slide.public_url}
            alt={slideIndex === index ? alt : ''}
            fill
            loading={slideIndex === 0 ? 'lazy' : 'lazy'}
            className="object-cover"
            sizes={sizes}
          />
        </div>
      ))}

      {showDots && slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Photo ${slideIndex + 1}`}
              aria-current={slideIndex === index}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIndex(slideIndex);
              }}
              className={`h-1.5 rounded-full transition ${
                slideIndex === index
                  ? 'w-4 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
