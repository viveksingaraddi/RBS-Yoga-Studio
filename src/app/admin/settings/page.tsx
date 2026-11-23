import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AdminSettingsForm from '@/components/admin/AdminSettingsForm';

export default async function AdminSettingsPage() {
  const settings = await prisma.businessSettings.findUnique({
    where: { id: 'singleton' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Studio Administration & Identity
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          Business & Brand Settings
        </h1>
        <p className="text-xs text-charcoal/70">
          Update verified instructor details, contact information, WhatsApp numbers, and operating parameters.
        </p>
      </div>

      <div className="bg-ivory border border-sage-dark/40 p-8 shadow-card max-w-4xl">
        <AdminSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
