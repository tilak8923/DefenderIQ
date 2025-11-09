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
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserId } from '@/hooks/use-user-id';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { LogEntry } from '@/lib/types';


const severities = ['ALL', 'CRITICAL', 'WARN', 'INFO', 'DEBUG'];

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

export default function LogsPage() {
  const userId = useUserId();
  const firestore = useFirestore();
  const [allLogEntries, setAllLogEntries] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    if (!userId || !firestore) return;
    
    const logsQuery = query(collection(firestore, 'users', userId, 'logs'));
    
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
        setAllLogEntries(logsData);
    });

    return () => unsubscribe();
  }, [userId, firestore]);

  const filteredLogs = allLogEntries.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

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
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
