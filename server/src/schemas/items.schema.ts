import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export const updateItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export const itemIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID").transform(Number),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemIdParam = z.infer<typeof itemIdSchema>;
