
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Rss } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sampleLogEntries } from '@/lib/data';
import type { LogEntry } from '@/lib/types';


const severities = ['ALL', 'CRITICAL', 'WARN', 'INFO', 'DEBUG'];
const sources = ['AuthService', 'WebServer', 'Database', 'Firewall', 'PaymentGateway'];
const messages = [
    'User login successful',
    'Failed login attempt',
    'Database connection established',
    'Port scan detected',
    'API rate limit exceeded',
    'Data export completed',
    'System health check OK',
    'Configuration updated',
    'Unexpected error processing request',
    'User password reset requested',
];


const getSeverityBadgeVariant = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'destructive';
    case 'WARN':
      return 'default';
    default:
      return 'outline';
  }
};

const createRandomLog = (): LogEntry => {
    const randomSeverity = severities[Math.floor(Math.random() * (severities.length - 1)) + 1] as LogEntry['severity'];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        severity: randomSeverity,
        source: randomSource,
        message: `${randomMessage} from IP ${(Math.random()*255).toFixed(0)}.${(Math.random()*255).toFixed(0)}.${(Math.random()*255).toFixed(0)}.${(Math.random()*255).toFixed(0)}`,
    };
};

export default function LogsPage() {
  const [allLogEntries, setAllLogEntries] = useState<LogEntry[]>(() => 
    sampleLogEntries.map((log, index) => ({
      ...log,
      id: `log-${index}`
    })).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    const intervalId = setInterval(() => {
        setAllLogEntries(prevLogs => [createRandomLog(), ...prevLogs]);
    }, 5000); // Add a new log every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);
  
  const filteredLogs = allLogEntries.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });
  
  const renderEmptyState = () => (
    <div className="text-center py-16">
        <Rss className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Log Data Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
            No log entries match your current filters.
        </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-2xl font-bold tracking-wider">Log Viewer</h1>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            {severities.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-md overflow-hidden flex-1">
        <div className="relative h-[calc(100vh-14rem)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Severity</TableHead>
                <TableHead className="w-[150px]">Source</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={4}>
                        {renderEmptyState()}
                    </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadgeVariant(log.severity)}
                        className={cn(log.severity === 'WARN' && 'bg-warning text-black')}
                      >
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.source}</TableCell>
                    <TableCell className="font-mono">{log.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
