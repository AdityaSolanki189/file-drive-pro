'use client';

import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { FileIcon, StarIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SideNav() {
    const pathname = usePathname();

    return (
        <div className="w-40 flex flex-col gap-4">
            <Link href="/files">
                <Button
                    variant={'link'}
                    className={clsx('flex gap-2', {
                        'text-blue-500': pathname.includes('/files')
                    })}
                >
                    <FileIcon /> All Files
                </Button>
            </Link>

            <Link href="/favorites">
                <Button
                    variant={'link'}
                    className={clsx('flex gap-2', {
                        'text-blue-500': pathname.includes(
                            '/favorites'
                        )
                    })}
                >
                    <StarIcon /> Favorites
                </Button>
            </Link>
        </div>
    );
}
