'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { UploadButton } from './upload-button';
import { FileCard } from './file-card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { SearchBar } from './search-bar';

function Placeholder() {
    return (
        <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Image
                alt="an image of a picture and directory icon"
                width="300"
                height="300"
                src="/empty.svg"
            />
            <div className="text-2xl">You have no files, upload one now</div>
        </div>
    );
}

interface FileBrowserProps {
    title: string;
    favorites?: boolean;
}

export function FileBrowser({ title, favorites }: FileBrowserProps) {
    const organization = useOrganization();
    const user = useUser();
    const [query, setQuery] = useState('');

    let orgId: string | undefined = undefined;
    if (organization.isLoaded && user.isLoaded) {
        orgId = organization.organization?.id ?? user.user?.id;
    }

    const files = useQuery(
        api.files.getFiles,
        orgId ? { orgId, query, favorites } : 'skip'
    );
    const isLoading = files === undefined;

    return (
        <div>
            {isLoading && (
                <div className="flex flex-col gap-8 w-full items-center mt-24">
                    <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
                    <div className="text-2xl">Loading your images...</div>
                </div>
            )}

            {!isLoading && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold">{title}</h1>

                        <SearchBar query={query} setQuery={setQuery} />

                        <UploadButton />
                    </div>

                    {files.length === 0 && <Placeholder />}

                    <div className="grid grid-cols-3 gap-4">
                        {files?.map((file) => {
                            return <FileCard key={file._id} file={file} />;
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
