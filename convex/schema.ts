import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const fileTypes = v.union(
    v.literal('image'),
    v.literal('csv'),
    v.literal('pdf')
);

export const userRoles = v.union(v.literal('admin'), v.literal('member'));

export default defineSchema({
    // File schema
    files: defineTable({
        name: v.string(),
        orgId: v.string(),
        fileId: v.id('_storage'),
        type: fileTypes,
        shouldDelete: v.optional(v.boolean()),
        userId: v.id('users')
    })
        .index('by_orgId', ['orgId'])
        .index('by_shouldDelete', ['shouldDelete']),
    // Favorite schema
    favorites: defineTable({
        fileId: v.id('files'),
        orgId: v.string(),
        userId: v.id('users')
    }).index('by_userId_orgId_filesId', ['userId', 'orgId', 'fileId']),
    // User schema
    users: defineTable({
        tokenIdentifier: v.string(),
        orgInfo: v.array(
            v.object({
                orgId: v.string(),
                role: userRoles
            })
        ),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string())
    }).index('by_tokenIdentifier', ['tokenIdentifier'])
});
