import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		name: v.string(),
		ownerId: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new Error("Unauthorized");
		}

		await ctx.db.insert("projects", {
			name: args.name,
			ownerId: args.ownerId,
			importStatus: "importing",
		});
	},
});

export const get = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return [];
			// throw new Error("Unauthorized");
		}
		return await ctx.db.query("projects").collect();
	},
});

