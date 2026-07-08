import AuthGuard from '@/src/components/auth/AuthGuard';
import Sidebar from '@/src/components/layout/Sidebar';

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <main className="min-h-[calc(100vh-4rem)] flex-1 bg-[#faf9f7]">{children}</main>
      </div>
    </AuthGuard>
  );
}
