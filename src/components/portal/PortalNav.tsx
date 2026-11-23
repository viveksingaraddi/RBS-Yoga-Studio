'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, Award, Video, Film, LogOut, ArrowLeft } from 'lucide-react';

export default function PortalNav({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'My Bookings', href: '/portal/bookings', icon: Calendar },
    { name: 'My Membership', href: '/portal/membership', icon: Award },
    { name: 'Live Sessions', href: '/portal/live', icon: Video },
    { name: 'Recorded Library', href: '/portal/recordings', icon: Film },
  ];

  return (
    <aside className="w-full md:w-64 bg-forest text-ivory shrink-0 border-r border-earth/20 flex flex-col justify-between p-6">
      <div className="space-y-8">
        {/* Studio Brand */}
        <div>
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-earth hover:text-ivory mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </Link>
          <h2 className="font-serif text-2xl font-semibold tracking-wider text-ivory">
            RBS YOGA
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-earth block">
            Learner Sanctuary
          </span>
        </div>

        {/* User Badge */}
        <div className="p-3 bg-forest-light border border-earth/20">
          <span className="text-[10px] uppercase tracking-widest text-earth font-semibold block">
            Practitioner
          </span>
          <p className="font-serif text-lg font-medium text-ivory truncate">{user.name}</p>
          <p className="text-[11px] text-ivory/60 truncate">{user.email}</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
                  isActive
                    ? 'bg-earth text-forest shadow-sm'
                    : 'text-ivory/75 hover:bg-forest-light hover:text-ivory'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-8 border-t border-ivory/15">
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
