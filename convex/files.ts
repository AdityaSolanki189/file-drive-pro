import { ConvexError, v } from 'convex/values';
import {
    MutationCtx,
    QueryCtx,
    internalMutation,
    mutation,
    query
} from './_generated/server';
import { getUser } from './users';
import { fileTypes } from './schema';
import { Doc, Id } from './_generated/dataModel';

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }

    const user = await ctx.db
        .query('users')
        .withIndex('by_tokenIdentifier', (q) =>
            q.eq('tokenIdentifier', identity.tokenIdentifier)
        )
        .first();

    if (!user) {
        return null;
    }

    const orgIds = user.orgInfo.map((org) => org.orgId);
    const hasAccess =
        orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

    if (!hasAccess) {
        return null;
    }

    return { user };
}

async function hasAccessToFile(
    ctx: QueryCtx | MutationCtx,
    fileId: Id<'files'>
) {
    const file = await ctx.db.get(fileId);

    if (!file) {
        return null;
    }

    const hasAccess = await hasAccessToOrg(ctx, file.orgId);

    if (!hasAccess) {
        return null;
    }

    return { user: hasAccess.user, file };
}

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError('User Not authenticated to create file');
    }

    return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string(),
        fileId: v.id('_storage'),
        type: fileTypes
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('User Not authenticated to create file');
        }

        const hasAccess = await hasAccessToOrg(ctx, args.orgId);

        if (!hasAccess) {
            throw new ConvexError('User does not have access to org');
        }

        await ctx.db.insert('files', {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type,
            userId: hasAccess.user._id
        });
    }
});

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean()),
        deletedOnly: v.optional(v.boolean()),
        type: v.optional(fileTypes)
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const hasAccess = await hasAccessToOrg(ctx, args.orgId);

        if (!hasAccess) {
            return [];
        }

        let files = await ctx.db
            .query('files')
            .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
            .collect();

        const query = args.query;

        if (query) {
            files = (await files).filter((file) =>
                file.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (args.favorites) {
            const favorites = await ctx.db
                .query('favorites')
                .withIndex('by_userId_orgId_filesId', (q) =>
                    q.eq('userId', hasAccess.user._id).eq('orgId', args.orgId)
                )
                .collect();

            files = files.filter((file) =>
                favorites.some((favorite) => favorite.fileId === file._id)
            );
        }

        if (args.deletedOnly) {
            files = files.filter((file) => file.shouldDelete);
        } else {
            files = files.filter((file) => !file.shouldDelete);
        }

        if (args.type) {
            files = files.filter((file) => file.type === args.type);
        }

        const filesWithUrl = await Promise.all(
            files.map(async (file) => ({
                ...file,
                url: await ctx.storage.getUrl(file.fileId)
            }))
        );

        return filesWithUrl;
    }
});

// move the file to trash bin
function assertCanDeleteFile(user: Doc<'users'>, file: Doc<'files'>) {
    const canDelete =
        file.userId === user._id ||
        user.orgInfo.find((org) => org.orgId === file.orgId)?.role === 'admin';

    if (!canDelete) {
        throw new ConvexError('User does not have access to file');
    }
}

export const deleteFile = mutation({
    args: {
        fileId: v.id('files')
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
            throw new ConvexError('User does not have access to file');
        }

        assertCanDeleteFile(access.user, access.file);

        await ctx.db.patch(args.fileId, {
            shouldDelete: true
        });
    }
});

export const restoreFile = mutation({
    args: {
        fileId: v.id('files')
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
            throw new ConvexError('User does not have access to file');
        }

        assertCanDeleteFile(access.user, access.file);

        await ctx.db.patch(args.fileId, {
            shouldDelete: false
        });
    }
});

export const deleteAllFiles = internalMutation({
    args: {},
    async handler(ctx) {
        const files = await ctx.db
            .query('files')
            .withIndex('by_shouldDelete', (q) => q.eq('shouldDelete', true))
            .collect();

        await Promise.all(
            files.map(async (file) => {
                await ctx.storage.delete(file.fileId);
                return await ctx.db.delete(file._id);
            })
        );
    }
});

export const toggleFavorite = mutation({
    args: {
        fileId: v.id('files')
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
            throw new ConvexError('User does not have access to file');
        }

        const favorite = await ctx.db
            .query('favorites')
            .withIndex('by_userId_orgId_filesId', (q) =>
                q
                    .eq('userId', access.user._id)
                    .eq('orgId', access.file.orgId)
                    .eq('fileId', access.file._id)
            )
            .first();

        if (!favorite) {
            await ctx.db.insert('favorites', {
                fileId: access.file._id,
                orgId: access.file.orgId,
                userId: access.user._id
            });
        } else {
            await ctx.db.delete(favorite._id);
        }
    }
});

export const getAllFavorites = query({
    args: {
        orgId: v.string()
    },
    async handler(ctx, args) {
        const hasAccess = await hasAccessToOrg(ctx, args.orgId);

        if (!hasAccess) {
            return [];
        }

        const favorites = await ctx.db
            .query('favorites')
            .withIndex('by_userId_orgId_filesId', (q) =>
                q.eq('userId', hasAccess.user._id).eq('orgId', args.orgId)
            )
            .collect();

        return favorites;
    }
});
