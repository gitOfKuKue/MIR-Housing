import AuthGuard from '@/src/components/auth/AuthGuard';
import Sidebar from '@/src/components/layout/Sidebar';

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-full min-h-0 overflow-hidden">
        <Sidebar />
        <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#faf9f7]">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
