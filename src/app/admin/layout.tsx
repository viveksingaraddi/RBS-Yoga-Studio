import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  // Strict RBAC: only ADMIN can access /admin routes
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F6F2]">
      <AdminNav user={{ name: session.name, email: session.email }} />
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
