import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Doc } from '../../../../convex/_generated/dataModel';
import { formatRelative } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileTextIcon, GanttChartIcon, ImageIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { FileCardActions } from './file-actions';
import Image from 'next/image';

interface FileCardProps {
    file: Doc<'files'> & { isFavorited: boolean; url: string | null };
}

export function FileCard({ file }: FileCardProps) {
    const typeIcons = {
        image: <ImageIcon />,
        pdf: <FileTextIcon />,
        csv: <GanttChartIcon />
    } as Record<Doc<'files'>['type'], ReactNode>;

    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId
    });

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2 text-base font-normal">
                    <div className="flex justify-center">
                        {typeIcons[file.type]}
                    </div>{' '}
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions
                        file={file}
                        isFavorited={file.isFavorited}
                    />
                </div>
            </CardHeader>
            <CardContent className="h-[200px] flex justify-center items-center">
                {file.type === 'image' && file.url && (
                    <Image
                        alt={file.name}
                        width="200"
                        height="100"
                        src={file.url}
                    />
                )}
                {file.type === 'csv' && (
                    <GanttChartIcon className="w-20 h-20" />
                )}
                {file.type === 'pdf' && <FileTextIcon className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={userProfile?.imageUrl} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {userProfile?.name}
                </div>
                <div className="text-xs text-gray-700">
                    Uploaded on{' '}
                    {formatRelative(new Date(file._creationTime), new Date())}
                </div>
            </CardFooter>
        </Card>
    );
}
