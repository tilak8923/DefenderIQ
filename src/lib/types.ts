export type Alert = {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: string;
  status: 'Active' | 'Resolved';
};

export type LogEntry = {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARN' | 'INFO' | 'DEBUG';
  source: string;
  message: string;
};

export type AlertRule = {
    id: string;
    name: string;
    condition: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    enabled: boolean;
};

export type SystemStatus = {
  name: string;
  status: 'Operational' | 'Degraded' | 'Offline';
};

export type UserProfile = {
    id: string;
    username?: string;
    email?: string;
    photoURL?: string;
};

export type Conversation = {
    id: string;
    participants: string[];
    participantDetails: UserProfile[];
    lastMessage?: string;
    lastMessageTimestamp?: string;
};

export type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
};
