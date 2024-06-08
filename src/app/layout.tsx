import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ConvexClientProvider from './ConvexClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'File  Drive Pro',
    description: 'Modern file storage and sharing',
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ConvexClientProvider>{children}</ConvexClientProvider>
            </body>
        </html>
    );
}
