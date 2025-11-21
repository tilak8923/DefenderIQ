'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { recentAlerts } from '@/lib/data';

interface HistoryItem {
  type: 'command' | 'response';
  content: string;
}

const asciiBanner = `
██████╗ ███████╗███████╗███████╗███╗   ██╗██████╗ ██╗ ██████╗ 
██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║██╔══██╗██║██╔═══██╗
██║  ██║█████╗  █████╗  █████╗  ██╔██╗ ██║██║  ██║██║██║   ██║
██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██║╚██╗██║██║  ██║██║██║▄▄ ██║
██████╔╝███████╗██║     ███████╗██║ ╚████║██████╔╝██║╚██████╔╝                                                                                                                                                                                                                                  
`;

const helpText = `
Available commands:
  help          - Shows this list of commands.
  list alerts   - Displays the most recent security alerts.
  ping <host>   - Simulates a ping to a host (e.g., ping 8.8.8.8).
  date          - Displays the current date and time.
  clear         - Clears the terminal screen.
`;

const processCommand = (command: string): string => {
    const [cmd, ...args] = command.toLowerCase().trim().split(' ');

    switch (cmd) {
        case 'help':
            return helpText;

        case 'list':
            if (args[0] === 'alerts') {
                const header = "Severity\tStatus  \tDescription\n" + "-".repeat(80);
                const rows = recentAlerts.map(a => `${a.severity.padEnd(10)}\t${a.status.padEnd(8)}\t${a.description}`).join('\n');
                return `${header}\n${rows}`;
            }
            return `Unknown argument for 'list'. Did you mean 'list alerts'?`;

        case 'ping':
            const host = args[0] || 'destination';
             if (!host) return "Usage: ping <host>";
            return `
Pinging ${host} with 32 bytes of data:
Reply from ${host}: bytes=32 time=12ms TTL=58
Reply from ${host}: bytes=32 time=11ms TTL=58
Reply from ${host}: bytes=32 time=12ms TTL=58

Ping statistics for ${host}:
    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 11ms, Maximum = 12ms, Average = 11ms
`;
        
        case 'date':
            return new Date().toString();

        default:
            return `Command not found: ${command}. Type 'help' for a list of commands.`;
    }
}

export function TerminalUI() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [running, setRunning] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setHistory([
        { type: 'response', content: `${asciiBanner}\nWelcome to DefendIQ Command Line Interface. Type 'help' for commands.`}
    ]);
  }, []);
  
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, running]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || running) return;

    if (input.trim().toLowerCase() === 'clear') {
        setHistory([]);
        setInput('');
        return;
    }
    
    const newHistory = [...history, { type: 'command' as const, content: input }];
    setHistory(newHistory);
    setInput('');
    setRunning(true);
    
    // Simulate async processing
    await new Promise(res => setTimeout(res, 200 + Math.random() * 300));
    
    const response = processCommand(input);
    setHistory((prev) => [...prev, { type: 'response', content: response }]);
    setRunning(false);
  };
  
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  }

  return (
    <div 
        className="h-full w-full bg-background text-foreground font-mono p-4 overflow-y-auto flex flex-col"
        onClick={handleTerminalClick}
    >
      <div className="flex-grow">
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.type === 'command' ? (
              <div className="flex items-center">
                <span className="text-primary mr-2">{'>'}</span>
                <span>{item.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: item.content}}></div>
            )}
          </div>
        ))}
        {running && 
            <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Executing...</span>
            </div>
        }
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleFormSubmit} className="flex items-center">
        <label htmlFor="terminal-input" className="text-primary mr-2">{'>'}</label>
        <input
          ref={inputRef}
          id="terminal-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          className="bg-transparent border-none text-foreground w-full focus:outline-none focus:ring-0"
          autoComplete="off"
          disabled={running}
        />
      </form>
    </div>
  );
}
