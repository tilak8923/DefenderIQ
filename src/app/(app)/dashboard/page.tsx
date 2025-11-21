'use client';

import { useState, useEffect } from 'react';
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
  dashboardStats as staticDashboardStats,
  eventsByType as staticEvents,
  systemStatus as staticSystemStatus,
  recentAlerts as staticRecentAlerts,
} from '@/lib/data';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
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
  const [dashboardStats, setDashboardStats] = useState(staticDashboardStats);
  const [eventsByType, setEventsByType] = useState(staticEvents);
  const [systemStatus, setSystemStatus] = useState(staticSystemStatus);
  const recentAlerts = staticRecentAlerts.map((alert, index) => ({...alert, id: `alert-${index}`}));

  useEffect(() => {
    const interval = setInterval(() => {
      // Update stats
      setDashboardStats(prevStats => ({
        ...prevStats,
        threatLevel: Math.max(20, Math.min(100, prevStats.threatLevel + Math.floor(Math.random() * 10) - 5)),
        alertsTriggered: prevStats.alertsTriggered + Math.floor(Math.random() * 2),
      }));

      // Update events chart
      setEventsByType(prevEvents => prevEvents.map(event => ({
        ...event,
        value: Math.max(10, event.value + Math.floor(Math.random() * 20) - 10),
      })));

      // Update system status
      setSystemStatus(prevStatus => {
        const randomIndex = Math.floor(Math.random() * prevStatus.length);
        return prevStatus.map((system, index) => {
          if (index === randomIndex && Math.random() > 0.7) {
            const statuses = ['Operational', 'Degraded', 'Offline'];
            const currentStatusIndex = statuses.indexOf(system.status);
            const nextStatusIndex = (currentStatusIndex + 1) % statuses.length;
            return { ...system, status: statuses[nextStatusIndex] };
          }
          // Occasionally, a system might recover
          if (system.status !== 'Operational' && Math.random() > 0.9) {
            return { ...system, status: 'Operational' };
          }
          return system;
        });
      });

    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
            <div className="text-2xl font-bold">{systemStatus.filter(s => s.status !== 'Operational').length}</div>
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
