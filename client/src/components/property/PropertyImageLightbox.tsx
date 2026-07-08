'use client';

import Image from 'next/image';
import { useEffect } from 'react';

interface PropertyImageLightboxProps {
  images: Array<{ id: string; public_url: string }>;
  activeIndex: number;
  propertyName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PropertyImageLightbox({
  images,
  activeIndex,
  propertyName,
  onClose,
  onNavigate,
}: PropertyImageLightboxProps) {
  const activeImage = images[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowLeft' && hasPrevious) {
        onNavigate(activeIndex - 1);
      }

      if (event.key === 'ArrowRight' && hasNext) {
        onNavigate(activeIndex + 1);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, hasNext, hasPrevious, onClose, onNavigate]);

  if (!activeImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${propertyName} image viewer`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
        aria-label="Close image viewer"
      >
        <CloseIcon />
      </button>

      {hasPrevious ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(activeIndex - 1);
          }}
          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
          aria-label="Previous image"
        >
          <ChevronLeftIcon />
        </button>
      ) : null}

      {hasNext ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(activeIndex + 1);
          }}
          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
          aria-label="Next image"
        >
          <span className="rotate-180">
            <ChevronLeftIcon />
          </span>
        </button>
      ) : null}

      <div
        className="relative h-[70vh] w-full max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={activeImage.public_url}
          alt={`${propertyName} full size image ${activeIndex + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80 sm:bottom-8">
        {activeIndex + 1} / {images.length}
      </p>
    </div>
  );
}
