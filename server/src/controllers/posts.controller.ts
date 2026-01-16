import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { createPostSchema, postIdSchema } from "../schemas/posts.schema";
import { ApiResponse } from "../utils/api-response";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// GET /api/posts - List all posts
export async function getAll(req: Request, res: Response) {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });
    ApiResponse.success(res, StatusCodes.OK, posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    ApiResponse.internalError(res, "Failed to fetch posts");
  }
}

// POST /api/posts - Create a post
export async function create(req: Request, res: Response) {
  try {
    const body = createPostSchema.safeParse(req.body);
    if (!body.success) {
      return ApiResponse.validationError(res, body.error);
    }

    const userId = (req as AuthRequest).userId;

    const post = await prisma.blogPost.create({
      data: {
        title: body.data.title,
        content: body.data.content,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });
    ApiResponse.success(res, StatusCodes.CREATED, post, "Post created successfully");
  } catch (error) {
    console.error("Error creating post:", error);
    ApiResponse.internalError(res, "Failed to create post");
  }
}

// PATCH /api/posts/:id/like - Like/unlike a post
export async function like(req: Request, res: Response) {
  try {
    const params = postIdSchema.safeParse(req.params);
    if (!params.success) {
      return ApiResponse.validationError(res, params.error);
    }

    const userId = (req as AuthRequest).userId;

    const post = await prisma.blogPost.findUnique({
      where: { id: params.data.id },
    });
    if (!post) {
      return ApiResponse.notFound(res, "Post not found");
    }

    // Check if already liked
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        postId_userId: {
          postId: params.data.id,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.blogLike.delete({
        where: { id: existingLike.id },
      });
      ApiResponse.success(res, StatusCodes.OK, { liked: false }, "Post unliked");
    } else {
      // Like
      await prisma.blogLike.create({
        data: {
          postId: params.data.id,
          userId: userId,
        },
      });
      ApiResponse.success(res, StatusCodes.OK, { liked: true }, "Post liked");
    }
  } catch (error) {
    console.error("Error liking post:", error);
    ApiResponse.internalError(res, "Failed to like post");
  }
}
