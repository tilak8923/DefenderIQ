// This file now contains only static data that is not user-specific
// or data that can be considered as initial/default state.
// User-specific data like alerts, logs, and alertRules are now fetched from Firestore.

import type { Alert, AlertRule, LogEntry } from "./types";

export const dashboardStats = {
  threatLevel: 78,
  alertsTriggered: 12,
  vulnerabilitiesDetected: 5,
  systemsAffected: 3,
};

export const eventsByType = [
  { name: 'Malware', value: 42, fill: 'hsl(var(--destructive))' },
  { name: 'Intrusion', value: 28, fill: 'hsl(var(--warning))' },
  { name: 'Policy Violation', value: 15, fill: 'hsl(var(--info))' },
  { name: 'Anomalous Activity', value: 78, fill: 'hsl(var(--primary))' },
];

export const systemStatus = [
  { name: 'Firewall', status: 'Operational' },
  { name: 'Auth Service', status: 'Operational' },
  { name: 'Database', status: 'Degraded' },
  { name: 'Web Server', status: 'Offline' },
  { name: 'Log Collector', status: 'Operational' },
];


// Default data for new users
export const defaultAlertRules: Omit<AlertRule, 'id'>[] = [
    {
        name: 'Brute Force Attempt Detected',
        condition: "event.type == 'failed_login' && count > 5",
        severity: 'High',
        enabled: true,
    },
    {
        name: 'Suspicious Login Location',
        condition: "event.type == 'login' && user.location != 'US'",
        severity: 'Medium',
        enabled: true,
    },
    {
        name: 'Admin Access from Unknown IP',
        condition: "user.role == 'admin' && !ip.known",
        severity: 'Critical',
        enabled: true,
    },
    {
        name: 'SQL Injection Attempt',
        condition: "request.uri.includes('sql')",
        severity: 'High',
        enabled: false,
    }
];

export const sampleLogEntries: Omit<LogEntry, 'id'>[] = [
    { timestamp: new Date().toISOString(), severity: 'WARN', source: 'AuthService', message: 'Failed login attempt for user: admin' },
    { timestamp: new Date(Date.now() - 2 * 60000).toISOString(), severity: 'INFO', source: 'WebServer', message: 'User alice logged in successfully from IP 192.168.1.10' },
    { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), severity: 'CRITICAL', source: 'Database', message: 'Connection to primary DB lost.' },
    { timestamp: new Date(Date.now() - 10 * 60000).toISOString(), severity: 'DEBUG', source: 'Firewall', message: 'Port 80 traffic allowed from 10.0.0.5' },
    { timestamp: new Date(Date.now() - 15 * 60000).toISOString(), severity: 'WARN', source: 'AuthService', message: 'Password reset requested for user: bob' }
];

export const recentAlerts: Omit<Alert, 'id'>[] = [
    {
        severity: 'High',
        description: 'Multiple failed login attempts for user `admin`',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'Active',
    },
    {
        severity: 'Medium',
        description: 'Unusual sign-in location detected for user `dave`',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'Resolved',
    },
    {
        severity: 'Critical',
        description: 'Potential DDoS attack detected from network 123.45.67.0/24',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        status: 'Active',
    }
];
