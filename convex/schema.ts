import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const fileTypes = v.union(
    v.literal('image'),
    v.literal('csv'),
    v.literal('pdf')
);

export default defineSchema({
    // File schema
    files: defineTable({
        name: v.string(),
        orgId: v.string(),
        fileId: v.id('_storage'),
        type: fileTypes
    }).index('by_orgId', ['orgId']),
    // Favorite schema
    favorites: defineTable({
        fileId: v.id('files'),
        orgId: v.string(),
        userId: v.id('users')
    }).index('by_userId_orgId_filesId', ['userId', 'orgId', 'fileId']),
    // User schema
    users: defineTable({
        tokenIdentifier: v.string(),
        orgIds: v.array(v.string())
    }).index('by_tokenIdentifier', ['tokenIdentifier'])
});
