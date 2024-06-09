import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
    FileTextIcon,
    GanttChartIcon,
    ImageIcon,
    MoreVertical,
    StarIcon,
    TrashIcon
} from 'lucide-react';
import { ReactNode, use, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Image from 'next/image';
import { toggleFavorite } from '../../../../convex/files';

function FileCardActions({ file }: { file: Doc<'files'> }) {
    const deleteFile = useMutation(api.files.deleteFile);
    const { toast } = useToast();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const toggleFavorite = useMutation(api.files.toggleFavorite);

    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await deleteFile({
                                    fileId: file._id
                                });
                                toast({
                                    variant: 'default',
                                    title: 'File deleted',
                                    description:
                                        'Your file is now gone from the system'
                                });
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => {
                            toggleFavorite({
                                fileId: file._id,
                            });
                        }}
                        className="flex gap-1 items-center cursor-pointer"
                    >
                        <StarIcon className="w-4 h-4" /> Favorite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsConfirmOpen(true)}
                        className="flex gap-1 text-red-600 items-center cursor-pointer"
                    >
                        <TrashIcon className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export function FileCard({ file }: { file: Doc<'files'> }) {
    const typeIcons = {
        image: <ImageIcon />,
        pdf: <FileTextIcon />,
        csv: <GanttChartIcon />
    } as Record<Doc<'files'>['type'], ReactNode>;

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2">
                    <div className="flex justify-center">
                        {typeIcons[file.type]}
                    </div>{' '}
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions file={file} />
                </div>
            </CardHeader>
            <CardContent className="h-[200px] flex justify-center items-center">
                {file.type === 'image' && <ImageIcon />}

                {file.type === 'csv' && (
                    <GanttChartIcon className="w-20 h-20" />
                )}
                {file.type === 'pdf' && <FileTextIcon className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button
                    onClick={() => {
                        window.open(' ', '_blank');
                    }}
                >
                    Download
                </Button>
            </CardFooter>
        </Card>
    );
}
