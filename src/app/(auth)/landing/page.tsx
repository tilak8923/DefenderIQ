
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BarChart, Bot, ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: ShieldCheck,
    title: 'Real-time Monitoring',
    description: 'Keep a constant eye on your systems with a live-updating dashboard and instant alerts.',
    delay: '100ms',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Leverage AI to analyze logs, detect threats, and generate comprehensive security reports.',
    delay: '200ms',
  },
  {
    icon: Terminal,
    title: 'Integrated Terminal',
    description: 'Run commands and interact with your security environment directly within the application.',
    delay: '300ms',
  },
  {
    icon: Bot,
    title: 'AI-Powered Assistance',
    description: 'Get help with threat analysis, report generation, and command-line operations from an intelligent assistant.',
    delay: '400ms',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes title-glow {
          0% { text-shadow: 0 0 5px hsl(var(--primary) / 0.5), 0 0 10px hsl(var(--primary) / 0.5); }
          50% { text-shadow: 0 0 10px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.8); }
          100% { text-shadow: 0 0 5px hsl(var(--primary) / 0.5), 0 0 10px hsl(var(--primary) / 0.5); }
        }
        .animate-fadeInUp {
           animation: fadeInUp 0.6s ease-out forwards;
           animation-delay: var(--animation-delay, 0s);
           opacity: 0;
        }
        .title {
            animation: fadeIn 1s ease-in, title-glow 4s ease-in-out infinite;
        }
      `}</style>
      
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <h1 className="title text-6xl md:text-8xl font-bold tracking-widest text-primary font-mono">
          TSIEM
        </h1>
        <p 
          className="animate-fadeInUp text-lg md:text-xl text-muted-foreground"
          style={{ '--animation-delay': '50ms' } as React.CSSProperties}
        >
          Your AI-Powered Security Information & Event Management Hub
        </p>
      </div>

      <div className="my-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="animate-fadeInUp"
            style={{ '--animation-delay': feature.delay } as React.CSSProperties}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 text-center h-full">
              <CardHeader>
                <div className="mx-auto bg-muted p-3 rounded-full mb-2">
                    <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div 
        className="animate-fadeInUp"
        style={{ '--animation-delay': '500ms' } as React.CSSProperties}
      >
        <Button size="lg" asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>

       <footer 
        className="absolute bottom-4 text-sm text-muted-foreground animate-fadeInUp"
        style={{ '--animation-delay': '600ms' } as React.CSSProperties}
       >
        Secure. Intelligent. Aware.
       </footer>
    </div>
  );
}
