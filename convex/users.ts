import { ConvexError, v } from 'convex/values';
import {
    MutationCtx,
    QueryCtx,
    internalMutation,
    query
} from './_generated/server';
import { userRoles } from './schema';

export async function getUser(
    ctx: QueryCtx | MutationCtx,
    tokenIdentifier: string
) {
    const user = await ctx.db
        .query('users')
        .withIndex('by_tokenIdentifier', (q) =>
            q.eq('tokenIdentifier', tokenIdentifier)
        )
        .first();

    if (!user) {
        throw new ConvexError('User not found with the given tokenIdentifier');
    }

    return user;
}

export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        imageUrl: v.string()
    },
    async handler(ctx, args) {
        await ctx.db.insert('users', {
            tokenIdentifier: args.tokenIdentifier,
            orgInfo: [],
            name: args.name,
            imageUrl: args.imageUrl
        });
    }
});

export const updateUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        imageUrl: v.string()
    },
    async handler(ctx, args) {
        const user = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) =>
                q.eq('tokenIdentifier', args.tokenIdentifier)
            )
            .first();

        if (!user) {
            throw new ConvexError(
                'User not found with the given tokenIdentifier'
            );
        }

        await ctx.db.patch(user._id, {
            name: args.name,
            imageUrl: args.imageUrl
        });
    }
});

export const addOrgIdToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: userRoles
    },
    async handler(ctx, args) {
        const user = await getUser(ctx, args.tokenIdentifier);

        await ctx.db.patch(user._id, {
            orgInfo: [...user.orgInfo, { orgId: args.orgId, role: args.role }]
        });
    }
});

export const updateOrgIdToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: userRoles
    },
    async handler(ctx, args) {
        const user = await getUser(ctx, args.tokenIdentifier);

        const org = user.orgInfo.find((org) => org.orgId === args.orgId);

        if (!org) {
            throw new ConvexError('User not in org');
        }

        org.role = args.role;

        await ctx.db.patch(user._id, {
            orgInfo: user.orgInfo
        });
    }
});

export const getUserProfile = query({
    args: {
        userId: v.id('users')
    },
    async handler(ctx, args) {
        const user = await ctx.db.get(args.userId);

        return {
            name: user?.name,
            imageUrl: user?.imageUrl
        };
    }
});

export const getUserInstance = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        const user = await getUser(ctx, identity.tokenIdentifier);

        if (!user) {
            return null;
        }

        return user;
    }
});
