'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOutUser } from '@/firebase/non-blocking-login';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/logs', label: 'Logs' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/reports', label: 'Reports' },
  { href: '/threat-intelligence', label: 'Threat Intel' },
  { href: '/threat-map', label: 'Threat Map' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/collectors', label: 'Collectors' },
  { href: '/terminal', label: 'Terminal' },
];

export function MainNav() {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-50 flex flex-col border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-widest">TSIEM</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOutUser(auth)}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto px-4 custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex items-center px-3 py-2 text-sm font-medium transition-colors border-t-2',
              pathname === item.href
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
