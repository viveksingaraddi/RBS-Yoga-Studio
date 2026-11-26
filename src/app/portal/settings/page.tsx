import { getCurrentUser } from '@/lib/auth';
import { getBusinessSettings } from '@/lib/settings';
import SettingsClient from './SettingsClient';
import { redirect } from 'next/navigation';

export default async function PortalSettingsPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  let settings = null;
  if (session.role === 'INSTRUCTOR' || session.role === 'ADMIN') {
    settings = await getBusinessSettings();
  }

  return (
    <SettingsClient
      userRole={session.role}
      userEmail={session.email}
      userName={session.name}
      initialSettings={settings}
    />
  );
}
