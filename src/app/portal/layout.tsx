import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import PortalNav from '@/components/portal/PortalNav';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-sage-light">
      <PortalNav user={{ name: session.name, email: session.email, role: session.role }} />
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
