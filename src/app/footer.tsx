import Link from 'next/link';

export function Footer() {
    return (
        <div className="h-20 bg-gray-100 fixed bottom-0 w-full flex items-center">
            <div className="container mx-auto flex justify-between items-center">
                <p>&copy; 2024 FileDrivePro . All rights reserved.</p>
                <nav>
                    <ul className="flex space-x-5 pr-5">
                        <li>
                            <Link
                                className="text-blue-900 hover:text-blue-500"
                                href="/privacy"
                            >
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link
                                className="text-blue-900 hover:text-blue-500"
                                href="/terms-of-service"
                            >
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link
                                className="text-blue-900 hover:text-blue-500"
                                href="/contact-us"
                            >
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
