
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
  Upload,
  Plug,
} from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/logs', icon: FileText, label: 'Logs' },
  { href: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/reports', icon: FileBarChart, label: 'Reports' },
  { href: '/threat-intelligence', icon: ShieldCheck, label: 'Threat Intel' },
  { href: '/analysis', icon: Zap, label: 'Analysis' },
  { href: '/ingestion', icon: Upload, label: 'Ingestion' },
  { href: '/collectors', icon: Plug, label: 'Collectors' },
  { href: '/terminal', icon: Terminal, label: 'Terminal' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 p-2">
       <div className="flex items-center gap-2 p-2">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-widest">TSIEM</h1>
      </div>
      <SidebarMenu>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className="justify-start"
              >
                <Link href={item.href}>
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}
