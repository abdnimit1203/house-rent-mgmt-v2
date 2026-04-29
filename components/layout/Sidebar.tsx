'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, UserPlus, 
  Settings, Droplet, CreditCard, LogOut, Home, User, Megaphone, X
} from 'lucide-react';
import { authApi } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Rooms', href: '/rooms' },
  { icon: Users, label: 'Tenants', href: '/tenants' },
  { icon: UserPlus, label: 'Meter Readings', href: '/meter-readings' },
  { icon: Droplet, label: 'Water Bills', href: '/water-bills' },
  { icon: CreditCard, label: 'Payments', href: '/payments' },
  { icon: Megaphone, label: 'Advertisements', href: '/advertisements' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 border-r dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-sm transition-transform duration-300 transform lg:translate-x-0 transition-colors",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      <div className="h-16 flex items-center justify-between px-6 border-b dark:border-slate-800">
        <Link href="/" className="text-lg font-bold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={onClose}>
          <img src="/logo.png" alt="ico" width={32} height={32} />
          BariBhara
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-slate-500" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active 
                  ? "bg-primary/10 text-primary dark:bg-primary/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "text-primary" : "text-slate-400 dark:text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t dark:border-slate-800 space-y-1">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === '/profile' ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === '/settings' ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="ghost" 
            className="flex-1 justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
