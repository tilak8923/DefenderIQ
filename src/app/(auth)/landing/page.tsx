
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, BarChart, Terminal, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
    {children}
  </a>
);

export default function LandingPage() {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#141413] text-white font-body">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#141413]/80 backdrop-blur-sm">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <Link href="/landing" className="flex items-center gap-2">
            {mounted && (
              <Image 
                src={theme === 'dark' ? '/logo.png' : '/logo2.png'} 
                alt="DefendIQ Logo" 
                width={45} 
                height={45} 
              />
            )}
            <span className="font-bold text-lg tracking-wider">DefendIQ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#about">About</NavLink>
            <DropdownMenu open={platformOpen} onOpenChange={setPlatformOpen}>
              <DropdownMenuTrigger
                onMouseEnter={() => setPlatformOpen(true)}
                onMouseLeave={() => setPlatformOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors outline-none"
              >
                Platform <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={() => setPlatformOpen(true)}
                onMouseLeave={() => setPlatformOpen(false)}
                className="bg-neutral-900 border-neutral-800 text-white data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="#overview">Overview</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/docs">Developer Docs</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={solutionOpen} onOpenChange={setSolutionOpen}>
              <DropdownMenuTrigger
                onMouseEnter={() => setSolutionOpen(true)}
                onMouseLeave={() => setSolutionOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors outline-none"
              >
                Solution <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={() => setSolutionOpen(true)}
                onMouseLeave={() => setSolutionOpen(false)}
                className="bg-neutral-900 border-neutral-800 text-white data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="#features">Features</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Unified Security. AI-Powered Clarity.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-300">
            The next-generation Security Information & Event Management platform that brings all your security data into a single, intelligent view.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild className="bg-white text-black hover:bg-neutral-200">
              <Link href="/signup">Request a Demo</Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="bg-transparent border-neutral-700 text-white hover:bg-neutral-900">
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center">About DefendIQ</h2>
            <p className="mx-auto mt-6 max-w-3xl text-center text-neutral-300">
              In an era of ever-evolving cyber threats, security teams are overwhelmed with alerts from countless disconnected tools. DefendIQ was built to solve this problem. We provide a unified platform that aggregates security data from all your sources, uses AI to detect real threats, and enables rapid, automated response. Our mission is to empower security teams to work smarter, faster, and more effectively.
            </p>
          </div>
        </section>

        {/* Platform Overview Section */}
        <section id="overview" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Platform Overview</h2>
                <p className="mt-4 text-neutral-300">
                  Our architecture is designed for scalability and speed, integrating seamlessly with your existing infrastructure. We combine the core functions of SIEM and SOAR into a single, powerful engine.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-start gap-3 p-4 rounded-lg hover:bg-neutral-900 transition-colors">
                    <ShieldCheck className="h-6 w-6 mt-1 text-white flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Detection & Response</h3>
                      <p className="text-sm text-neutral-400">
                        Leverage rule-based correlation and AI-powered anomaly detection to identify threats, then automate responses with customizable playbooks.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-lg hover:bg-neutral-900 transition-colors">
                    <BarChart className="h-6 w-6 mt-1 text-white flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Data Normalization</h3>
                      <p className="text-sm text-neutral-400">
                        Ingest and standardize logs from any source into a common schema, ensuring data is clean, correlated, and ready for analysis.
                      </p>
                    </div>
                  </li>
                </ul>
                <Button asChild variant="link" className="text-white pl-0 mt-4">
                  <Link href="/docs">View Developer Docs &rarr;</Link>
                </Button>
              </div>
              <div className="bg-neutral-900 p-8 rounded-lg">
                <pre className="text-sm text-neutral-400">
                  <code>
{`// Example: Automated Threat Response
const alert = await siem.on('HighSeverityAlert');

if (alert.matches(PhishingAttempt)) {
    const playbook = soar.getPlaybook('PhishingResponse');
    await playbook.run({
        user: alert.user,
        sourceIp: alert.source.ip
    });
    logger.info('Phishing attempt contained.');
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Solution/Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">A Complete Security Solution</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
              From log collection to incident response, DefendIQ provides the tools you need to secure your organization.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all">
                <BarChart className="h-8 w-8 mx-auto text-white" />
                <h3 className="mt-4 text-lg font-semibold">Real-time Dashboard</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Visualize your security posture at a glance with customizable widgets for alerts, threats, and system status.
                </p>
              </div>
              <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all">
                <Terminal className="h-8 w-8 mx-auto text-white" />
                <h3 className="mt-4 text-lg font-semibold">Advanced Log Analysis</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Search, filter, and analyze billions of log events in seconds. Use our AI to parse and structure any log format.
                </p>
              </div>
              <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all">
                <ShieldCheck className="h-8 w-8 mx-auto text-white" />
                <h3 className="mt-4 text-lg font-semibold">Automated Response</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Build powerful automation playbooks to handle incidents, enrich data, and contain threats without manual intervention.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-800">
        <div className="container mx-auto py-6 px-4 md:px-6 text-center text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} DefendIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

    

    