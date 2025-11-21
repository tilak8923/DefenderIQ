'use client';

import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <style jsx>{`
        .dot-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0);
          background-size: 2rem 2rem;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
           animation: fadeInUp 0.8s ease-out forwards;
           opacity: 0;
        }
      `}</style>
      
      <div className="absolute inset-0 dot-grid z-0"></div>
      
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center text-center p-4">
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-center">
            <Link href="/landing" className="flex items-center gap-2">
                <Shield className="h-7 w-7" />
                <span className="font-bold text-xl tracking-wider">TSIEM</span>
            </Link>
        </header>

        <main className="flex flex-col items-center justify-center">
            <h1 
                className="text-4xl md:text-6xl font-bold tracking-tighter !font-headline animate-fadeInUp"
            >
                Unified Security. AI-Powered Clarity.
            </h1>
            <p 
                className="mx-auto mt-6 max-w-xl text-lg text-neutral-300 animate-fadeInUp"
                style={{ animationDelay: '0.2s' }}
            >
               The next-generation Security Information & Event Management platform that brings all your security data into a single, intelligent view.
            </p>
            <div 
                className="mt-10 flex gap-4 animate-fadeInUp"
                style={{ animationDelay: '0.4s' }}
            >
                <Button size="lg" asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                     <Link href="/login">Get Started</Link>
                </Button>
                <Button size="lg" asChild variant="secondary" className="bg-white text-black hover:bg-neutral-200">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </main>

        <footer className="absolute bottom-0 p-6 text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} TSIEM. All rights reserved.
        </footer>
       </div>
    </div>
  );
}
