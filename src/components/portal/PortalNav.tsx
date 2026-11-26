'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  Film,
  Award,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  KeyRound,
} from 'lucide-react';

export default function PortalNav({
  user,
}: {
  user: { name: string; email: string; role?: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isInstructor = user.role === 'INSTRUCTOR' || user.role === 'ADMIN';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const instructorNavItems = [
    { name: 'Overview', href: '/portal', icon: LayoutDashboard },
    { name: 'Student Management', href: '/portal/students', icon: Users },
    { name: 'Class Management', href: '/portal/classes', icon: Calendar },
    { name: 'Live Sessions', href: '/portal/live-sessions', icon: Video },
    { name: 'Recorded Library', href: '/portal/recordings', icon: Film },
    { name: 'Subscriptions & Plans', href: '/portal/subscriptions', icon: Award },
    { name: 'Payments & Earnings', href: '/portal/payments', icon: CreditCard },
    { name: 'Notifications', href: '/portal/notifications', icon: Bell },
    { name: 'Studio Settings', href: '/portal/settings', icon: Settings },
  ];

  const learnerNavItems = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'My Bookings', href: '/portal/bookings', icon: Calendar },
    { name: 'My Membership', href: '/portal/membership', icon: Award },
    { name: 'Live Sessions', href: '/portal/live', icon: Video },
    { name: 'Recorded Library', href: '/portal/recordings', icon: Film },
    { name: 'Security & Password', href: '/portal/settings', icon: KeyRound },
  ];

  const navItems = isInstructor ? instructorNavItems : learnerNavItems;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-forest text-ivory p-4 flex items-center justify-between border-b border-earth/20 sticky top-0 z-40">
        <div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-earth block">
            {isInstructor ? 'Instructor Console' : 'Learner Sanctuary'}
          </span>
          <h2 className="font-serif text-lg font-semibold tracking-wider text-ivory">
            RBS YOGA STUDIO
          </h2>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-ivory hover:text-earth focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-forest text-ivory shrink-0 border-r border-earth/20 flex flex-col justify-between transition-all duration-300 z-50 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col h-full overflow-y-auto">
          {/* Header & Brand */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs text-earth hover:text-ivory transition-colors group"
                title="Return to Public Website"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                {!isCollapsed && <span>Public Website</span>}
              </Link>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:inline-flex p-1.5 text-ivory/60 hover:text-earth hover:bg-forest-light transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed ? (
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-wider text-ivory">
                  RBS YOGA
                </h2>
                <span className="text-[9px] uppercase tracking-[0.25em] text-earth block font-semibold">
                  {isInstructor ? 'Lead Instructor Studio' : 'Learner Sanctuary'}
                </span>
              </div>
            ) : (
              <div className="text-center font-serif text-xl font-bold text-earth py-1">
                RBS
              </div>
            )}

            {/* User Profile Badge */}
            <div
              className={`bg-forest-light border border-earth/20 transition-all ${
                isCollapsed ? 'p-2 text-center' : 'p-3'
              }`}
            >
              {!isCollapsed ? (
                <>
                  <span className="text-[9px] uppercase tracking-widest text-earth font-bold block">
                    {isInstructor ? 'Lead Yoga Master' : 'Practitioner'}
                  </span>
                  <p className="font-serif text-sm font-medium text-ivory truncate">{user.name}</p>
                  <p className="text-[10px] text-ivory/60 truncate">{user.email}</p>
                </>
              ) : (
                <div
                  className="w-8 h-8 mx-auto bg-earth text-forest font-serif font-bold flex items-center justify-center text-xs"
                  title={`${user.name} (${user.email})`}
                >
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/portal'
                  ? pathname === '/portal'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all relative group ${
                    isActive
                      ? 'bg-earth text-forest shadow-sm'
                      : 'text-ivory/75 hover:bg-forest-light hover:text-ivory'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}

                  {/* Floating tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-forest border border-earth/30 text-ivory text-[11px] font-sans whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-ivory/15 mt-4">
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Sign Out' : undefined}
              className={`flex items-center space-x-2 text-xs uppercase tracking-widest text-ivory/70 hover:text-earth transition-colors w-full px-3 py-2 ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
