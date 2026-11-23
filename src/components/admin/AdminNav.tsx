'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  Award,
  Video,
  Film,
  MessageSquare,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

export default function AdminNav({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Learners', href: '/admin/learners', icon: Users },
    { name: 'Programs', href: '/admin/programs', icon: BookOpen },
    { name: 'Schedules', href: '/admin/schedules', icon: Calendar },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Memberships', href: '/admin/memberships', icon: Award },
    { name: 'Live Sessions', href: '/admin/live-sessions', icon: Video },
    { name: 'Recordings', href: '/admin/recordings', icon: Film },
    { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    { name: 'Business Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-forest-dark text-ivory shrink-0 border-r border-earth/20 flex flex-col justify-between p-6">
      <div className="space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-earth hover:text-ivory mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </Link>
          <h2 className="font-serif text-2xl font-semibold tracking-wider text-ivory">
            RBS YOGA
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-earth font-bold block">
            Studio Administration
          </span>
        </div>

        {/* User Badge */}
        <div className="p-3 bg-forest border border-earth/20">
          <span className="text-[10px] uppercase tracking-widest text-earth font-semibold block">
            Administrator
          </span>
          <p className="font-serif text-base font-medium text-ivory truncate">{user.name}</p>
          <p className="text-[11px] text-ivory/60 truncate">{user.email}</p>
        </div>

        {/* Nav list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                  isActive
                    ? 'bg-earth text-forest shadow-sm'
                    : 'text-ivory/70 hover:bg-forest hover:text-ivory'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-ivory/15">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-ivory/70 hover:text-earth transition-colors w-full px-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
