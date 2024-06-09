import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export function Header() {
    return (
        <div className="border-b">
            <div className="container mx-auto p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">FileDrivePro 🚀</h1>
                <div className="flex gap-2">
                    <OrganizationSwitcher/>
                    <UserButton/>
                </div>
            </div>
        </div>
    );
}
