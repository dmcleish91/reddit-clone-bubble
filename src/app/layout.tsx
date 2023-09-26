import { cn } from '@/lib/utils';
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bubble',
  description: 'A reddit clone built with Next.js and Typescript',
};

export default function RootLayout({ children, authModal }: { children: React.ReactNode; authModal: React.ReactNode }) {
  return (
    <html lang='en' className={cn('bg-white text-slate-900 antialiased', inter.className)}>
      <body className={'min-h-screen pt-12 bg-slate-50 antialiased'}>
        <Providers>
          <Navbar />
          {authModal}

          <div className='container max-w-full mx-auto h-full pt-12'>{children}</div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
