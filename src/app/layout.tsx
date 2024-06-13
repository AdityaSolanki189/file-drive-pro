import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ConvexClientProvider from './ConvexClientProvider';
import { Header } from './header';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from './footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'File  Drive Pro',
    description: 'Modern file storage and sharing'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ConvexClientProvider>
                    <Toaster />
                    <Header />
                    {children}
                    <Footer/>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
