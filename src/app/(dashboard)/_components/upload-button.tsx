'use client';

import { Button } from '@/components/ui/button';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Doc } from '../../../../convex/_generated/dataModel';

const formSchema = z.object({
    title: z.string().min(1).max(100),
    file: z
        .custom<FileList>((val) => val instanceof FileList, 'Required')
        .refine((val) => val.length > 0, 'Required')
});

export function UploadButton() {
    const { toast } = useToast();
    const organization = useOrganization();
    const user = useUser();
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            file: undefined
        }
    });

    const fileRef = form.register('file');

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!orgId) return;

        const postUrl = await generateUploadUrl();
        const fileType = values.file[0].type;

        const result = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': values.file[0].type },
            body: values.file[0]
        });

        const { storageId } = await result.json();
        const types = {
            'image/jpeg': 'image',
            'image/png': 'image',
            'application/pdf': 'pdf',
            'text/csv': 'csv'
        } as Record<string, Doc<'files'>['type']>;

        try {
            await createFile({
                name: values.title,
                fileId: storageId,
                orgId,
                type: types[fileType]
            });

            form.reset();

            setIsDialogOpen(false);

            toast({
                variant: 'success',
                title: 'File uploaded',
                description: 'Your file has been uploaded successfully'
            });
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: 'Your file could not be uploaded'
            });
        }
    }
    let orgId: string | undefined = undefined;
    if (organization.isLoaded && user.isLoaded) {
        orgId = organization.organization?.id ?? user.user?.id;
    }

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const createFile = useMutation(api.files.createFile);

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                form.reset();
            }}
        >
            <DialogTrigger asChild>
                <Button onClick={() => {}}>Upload File</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-6">
                        Upload your File Here
                    </DialogTitle>
                </DialogHeader>

                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="file"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>File</FormLabel>
                                        <FormControl className="cursor-pointer">
                                            <Input type="file" {...fileRef} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="flex gap-1"
                            >
                                {form.formState.isSubmitting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Submit
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
