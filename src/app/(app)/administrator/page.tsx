'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, BarChart3, Settings2 } from 'lucide-react';

const adminOptions = [
    { title: 'User Management', description: 'Add, remove, or modify user accounts and permissions.', icon: Users },
    { title: 'Security Policies', description: 'Define and manage global security rules and policies.', icon: Shield },
    { title: 'System Audits', description: 'View audit logs and track administrator actions.', icon: BarChart3 },
    { title: 'System Configuration', description: 'Configure global settings for the application.', icon: Settings2 },
];

export default function AdministratorPage() {
  return (
    <div>
        <h1 className="text-2xl font-bold tracking-wider mb-4">Administrator Panel</h1>
        <p className="text-muted-foreground mb-6">
            Global configuration and system management tools.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminOptions.map((option) => (
                <Card key={option.title} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                         <div className="bg-muted p-3 rounded-lg">
                            <option.icon className="h-6 w-6 text-primary" />
                         </div>
                         <div>
                            <CardTitle>{option.title}</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{option.description}</CardDescription>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}