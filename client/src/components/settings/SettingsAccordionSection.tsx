'use client';

import { useId, useState, type ReactNode } from 'react';

interface SettingsAccordionSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-[#6b7280] transition-transform duration-200 ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SettingsAccordionSection({
  title,
  description,
  defaultOpen = false,
  children,
}: SettingsAccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <section className="overflow-hidden rounded-xl border border-[#e8e4dc] bg-white">
      <h2 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-[#fafaf9]"
        >
          <span className="min-w-0">
            <span className="block text-lg font-semibold text-[#1a1a1a]">
              {title}
            </span>
            {description ? (
              <span className="mt-1 block text-sm font-normal text-[#6b7280]">
                {description}
              </span>
            ) : null}
          </span>
          <ChevronIcon open={open} />
        </button>
      </h2>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={open ? 'border-t border-[#e8e4dc] px-6 pb-6 pt-5' : undefined}
      >
        {open ? children : null}
      </div>
    </section>
  );
}
