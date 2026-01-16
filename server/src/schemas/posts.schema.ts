import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Content is required"),
});

export const postIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID").transform(Number),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostIdParam = z.infer<typeof postIdSchema>;
