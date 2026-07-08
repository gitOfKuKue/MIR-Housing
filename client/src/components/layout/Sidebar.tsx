'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'mir_housing_sidebar_collapsed';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive: (pathname: string) => boolean;
}

function PropertiesIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
    >
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

const navItems: NavItem[] = [
  {
    label: 'Properties',
    href: '/properties',
    icon: <PropertiesIcon />,
    isActive: (pathname) => pathname.startsWith('/properties'),
  },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === 'true') {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 self-start border-r border-[#e8e4dc] bg-white transition-[width] duration-300 ease-in-out md:flex md:flex-col ${
        collapsed ? 'w-[4.5rem]' : 'w-60'
      } ${className ?? ''}`}
    >
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {!collapsed ? (
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            Menu
          </p>
        ) : (
          <div className="mb-2 h-5" aria-hidden="true" />
        )}

        {navItems.map((item) => {
          const active = item.isActive(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              } ${
                active
                  ? 'bg-[#e8f3ed] text-[#1e4636]'
                  : 'text-[#4b5563] hover:bg-[#f7f4ef] hover:text-[#1e4636]'
              }`}
            >
              <span
                className={`shrink-0 ${active ? 'text-[#1e4636]' : 'text-[#9ca3af]'}`}
              >
                {item.icon}
              </span>
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e8e4dc] p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-[#6b7280] transition hover:bg-[#f7f4ef] hover:text-[#1e4636] ${
            collapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <ChevronIcon collapsed={collapsed} />
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
