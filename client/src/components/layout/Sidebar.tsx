'use client';

import { useTranslations } from '@/src/i18n';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'mir_housing_sidebar_collapsed';

interface NavItem {
  labelKey: 'nav.properties' | 'nav.settings' | 'nav.profile';
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

function ProfileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.1.62 1.8 1.8 0 0 0-.3 1.16V21a2 2 0 0 1-4 0v-.22a1.8 1.8 0 0 0-.3-1.16 1.8 1.8 0 0 0-1.1-.62 1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.62-1.1 1.8 1.8 0 0 0-1.16-.3H3a2 2 0 0 1 0-4h.22a1.8 1.8 0 0 0 1.16-.3 1.8 1.8 0 0 0 .62-1.1 1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.8 1.8 0 0 0 9 4.6c.42 0 .83-.17 1.1-.62.2-.26.3-.65.3-1.16V3a2 2 0 0 1 4 0v.22c0 .51.1.9.3 1.16.27.45.68.62 1.1.62a1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06c-.48.48-.6 1.25-.36 1.98.08.26.17.42.36.62.26.27.65.3 1.16.3H21a2 2 0 0 1 0 4h-.22c-.51 0-.9.03-1.16.3-.19.2-.28.36-.36.62Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
    labelKey: 'nav.properties',
    href: '/properties',
    icon: <PropertiesIcon />,
    isActive: (pathname) => pathname.startsWith('/properties'),
  },
  {
    labelKey: 'nav.settings',
    href: '/settings',
    icon: <SettingsIcon />,
    isActive: (pathname) => pathname.startsWith('/settings'),
  },
];

const profileItem: NavItem = {
  labelKey: 'nav.profile',
  href: '/profile',
  icon: <ProfileIcon />,
  isActive: (pathname) => pathname.startsWith('/profile'),
};

function NavLink({
  item,
  collapsed,
  pathname,
  label,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  label: string;
}) {
  const active = item.isActive(pathname);

  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition ${
        collapsed ? 'justify-center px-2' : 'gap-3 px-3'
      } ${
        active
          ? 'bg-[#e8f3ed] text-[#1e4636]'
          : 'text-[#4b5563] hover:bg-[#f7f4ef] hover:text-[#1e4636]'
      }`}
    >
      <span className={`shrink-0 ${active ? 'text-[#1e4636]' : 'text-[#9ca3af]'}`}>
        {item.icon}
      </span>
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}

export default function Sidebar({ className }: { className?: string }) {
  const t = useTranslations();
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

  const collapseLabel = collapsed ? t('common.expand') : t('common.collapse');

  return (
    <aside
      className={`hidden h-full shrink-0 border-r border-[#e8e4dc] bg-white transition-[width] duration-300 ease-in-out md:flex md:flex-col ${
        collapsed ? 'w-[4.5rem]' : 'w-60'
      } ${className ?? ''}`}
    >
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <div
          className={`mb-2 flex items-center ${
            collapsed ? 'justify-center' : 'justify-between gap-2 px-1'
          }`}
        >
          {!collapsed ? (
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              {t('common.menu')}
            </p>
          ) : null}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapseLabel}
            title={collapseLabel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f7f4ef] hover:text-[#1e4636]"
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            pathname={pathname}
            label={t(item.labelKey)}
          />
        ))}
      </nav>

      <div className="border-t border-[#e8e4dc] p-3">
        <NavLink
          item={profileItem}
          collapsed={collapsed}
          pathname={pathname}
          label={t(profileItem.labelKey)}
        />
      </div>
    </aside>
  );
}
