import { Button } from '@/components/ui/button';
import {
    OrganizationSwitcher,
    SignInButton,
    SignedOut,
    UserButton,
    SignedIn
} from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
    return (
        <div className="border-b py-1 bg-gray-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link
                    href={'/'}
                    className="flex gap-2 items-center text-xl text-black"
                >
                    <Image
                        src="/logo.png"
                        alt="FileDrivePro"
                        width="65"
                        height="65"
                    />
                    <h3 className="text-2xl font-bold">FileDrivePro</h3>
                </Link>

                <SignedIn>
                    <Button variant={'outline'}>
                        <Link href="/files">Your Files</Link>
                    </Button>
                </SignedIn>

                <div className="flex gap-2">
                    <OrganizationSwitcher />
                    <UserButton />

                    <SignedOut>
                        <SignInButton>
                            <Button>Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </div>
    );
}
