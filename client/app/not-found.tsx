import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found | MIR Housing',
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4 py-10">
      <div className="max-w-md rounded-xl border border-[#e8e4dc] bg-white px-6 py-10 text-center shadow-sm sm:px-8">
        <p className="text-6xl font-bold tracking-tight text-[#1e4636]">404</p>
        <h1 className="mt-4 text-xl font-semibold text-[#1a1a1a]">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          The page you are looking for does not exist, or you may not have
          permission to view it.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/properties"
            className="inline-flex rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828]"
          >
            Go to properties
          </Link>
          <Link
            href="/login"
            className="inline-flex rounded-lg border border-[#e5e7eb] px-5 py-2.5 text-sm font-semibold text-[#4b5563] transition hover:border-[#1e4636] hover:text-[#1e4636]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
