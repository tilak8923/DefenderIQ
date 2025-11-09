'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  ShieldAlert,
  ServerCrash,
  FileWarning,
} from 'lucide-react';
import {
  dashboardStats,
  eventsByType as staticEvents,
  systemStatus as staticSystemStatus,
} from '@/lib/data';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import { useUserId } from '@/hooks/use-user-id';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Alert, SystemStatus } from '@/lib/types';


function getSeverityBadge(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getStatusIndicator(status: string) {
    switch (status) {
        case 'Operational':
            return 'bg-green-500';
        case 'Degraded':
            return 'bg-yellow-500';
        case 'Offline':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
}

export default function DashboardPage() {
  const userId = useUserId();
  const firestore = useFirestore();
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>(staticSystemStatus);
  const [eventsByType, setEventsByType] = useState(staticEvents);

  useEffect(() => {
    if (!userId || !firestore) return;

    const alertsQuery = query(
        collection(firestore, 'users', userId, 'alerts'),
        orderBy('timestamp', 'desc'),
        limit(5)
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
        setRecentAlerts(alertsData);
    });

    return () => unsubscribe();
  }, [userId, firestore]);


  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wider">Dashboard</h1>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-blink"></div>
            <span className="text-sm text-primary">LIVE</span>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {dashboardStats.threatLevel}%
            </div>
            <p className="text-xs text-muted-foreground">High risk detected</p>
            <Progress
              value={dashboardStats.threatLevel}
              className="mt-2 h-2 [&>div]:bg-destructive"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Triggered</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.alertsTriggered}</div>
            <p className="text-xs text-muted-foreground">in the last 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.vulnerabilitiesDetected}</div>
            <p className="text-xs text-muted-foreground">newly discovered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Systems Affected</CardTitle>
            <ServerCrash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.systemsAffected}</div>
            <p className="text-xs text-muted-foreground">currently impacted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Critical and high-priority alerts from the last 12 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge variant={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                    </TableCell>
                    <TableCell>{alert.description}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-2 ${alert.status === 'Active' ? 'text-destructive' : ''}`}>
                         {alert.status === 'Active' && <div className="h-2 w-2 rounded-full bg-destructive animate-blink"></div>}
                         {alert.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Breakdown of security events by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={eventsByType} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" radius={5}>
                    <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
            <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time status of monitored systems.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {systemStatus.map((system) => (
                    <div key={system.name} className="flex items-center gap-3">
                         <div className={`h-3 w-3 rounded-full ${getStatusIndicator(system.status)}`}></div>
                         <div>
                            <p className="font-medium">{system.name}</p>
                            <p className="text-xs text-muted-foreground">{system.status}</p>
                         </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
