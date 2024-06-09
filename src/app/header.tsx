import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignInButton, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
    return (
        <div className="border-b py-4 bg-gray-50">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">FileDrivePro 🚀</h1>
                <div className="flex gap-2">
                    <OrganizationSwitcher/>
                    <UserButton/>

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
