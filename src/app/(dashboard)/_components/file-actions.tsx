import { Doc, Id } from '../../../../convex/_generated/dataModel';
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
    DownloadIcon,
    MoreVertical,
    StarIcon,
    TrashIcon,
    UndoIcon
} from 'lucide-react';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Protect } from '@clerk/nextjs';

interface FileCardActionsProps {
    file: Doc<'files'>;
    isFavorited: boolean;
}

export function FileCardActions({ file, isFavorited }: FileCardActionsProps) {
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
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
                            This action will mark the file for deletion. It will
                            be moved to the Trash bin. And it will be
                            permanently deleted after 30 days.
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
                                    title: 'File marked for deletion',
                                    description:
                                        'Your file is now moved to the Trash bin. It will be permanently deleted after 30 days.'
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
                            window.open('', '_blank');
                        }}
                        className="flex gap-2 items-center cursor-pointer"
                    >
                        <DownloadIcon className="w-4 h-4" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            toggleFavorite({
                                fileId: file._id
                            });
                        }}
                        className="flex gap-2 cursor-pointer justify-start items-center"
                        disabled={file.shouldDelete}
                    >
                        {isFavorited ? (
                            <>
                                <StarIcon
                                    className="w-4 h-4 text-yellow-300"
                                    fill="yellow"
                                />
                                Unfavorite
                            </>
                        ) : (
                            <>
                                <StarIcon className="w-4 h-4" />
                                Favorite
                            </>
                        )}
                    </DropdownMenuItem>
                    <Protect role="org:admin" fallback={<></>}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                if (file.shouldDelete) {
                                    restoreFile({
                                        fileId: file._id
                                    });
                                } else {
                                    setIsConfirmOpen(true);
                                }
                            }}
                        >
                            {file.shouldDelete ? (
                                <div className="flex gap-2 text-green-600 items-center cursor-pointer">
                                    <UndoIcon className="w-4 h-4" /> Restore
                                </div>
                            ) : (
                                <div className="flex gap-2 text-red-600 items-center cursor-pointer">
                                    <TrashIcon className="w-4 h-4" /> Delete
                                </div>
                            )}
                        </DropdownMenuItem>
                    </Protect>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export function getFileUrl(fileId: Id<'_storage'>): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}
