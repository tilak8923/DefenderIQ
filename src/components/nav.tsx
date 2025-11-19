'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  FileBarChart,
  ShieldCheck,
  Terminal,
  Shield,
  Zap,
  Plug,
  LogOut,
  Map,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOutUser } from '@/firebase/non-blocking-login';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/logs', icon: FileText, label: 'Logs' },
  { href: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/reports', icon: FileBarChart, label: 'Reports' },
  { href: '/threat-intelligence', icon: ShieldCheck, label: 'Threat Intel' },
  { href: '/threat-map', icon: Map, label: 'Threat Map' },
  { href: '/analysis', icon: Zap, label: 'Analysis' },
  { href: '/collectors', icon: Plug, label: 'Collectors' },
  { href: '/terminal', icon: Terminal, label: 'Terminal' },
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
      <nav className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto px-4 pb-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
