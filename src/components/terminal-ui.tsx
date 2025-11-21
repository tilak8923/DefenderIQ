'use client';

import { useState, useRef, useEffect } from 'react';
import { appCli } from '@/ai/flows/app-cli';
import { cn } from '@/lib/utils';

interface HistoryItem {
  type: 'command' | 'response';
  content: string;
}

const asciiBanner = `
██████╗ ███████╗███████╗███████╗███╗   ██╗██████╗ ████CAG╗
██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║██╔══██╗╚████║
██║  ██║█████╗  █████╗  █████╗  ██╔██╗ ██║██║  ██║ ██╔═╝
██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝
██████╔╝███████╗██║     ███████╗██║ ╚████║██████╔╝██████╗
╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═════╝
             d e f e n d i q . c o m                                                    
`;

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
    
    const newHistory = [...history, { type: 'command' as const, content: input }];
    setHistory(newHistory);
    setInput('');
    setRunning(true);
    
    try {
      const result = await appCli({ command: input });
      if (result) {
        setHistory((prev) => [...prev, { type: 'response', content: result.response }]);
      }
    } catch (error) {
      console.error("Error getting assistance:", error);
      setHistory((prev) => [...prev, { type: 'response', content: "An error occurred." }]);
    } finally {
      setRunning(false);
    }
  };
  
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  }

  return (
    <div 
        className="h-full w-full bg-black text-primary font-mono p-4 overflow-y-auto flex flex-col"
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
          className="bg-transparent border-none text-primary w-full focus:outline-none focus:ring-0"
          autoComplete="off"
          disabled={running}
        />
      </form>
    </div>
  );
}

    