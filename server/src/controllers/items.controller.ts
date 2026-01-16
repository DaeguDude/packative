import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import {
  createItemSchema,
  updateItemSchema,
  itemIdSchema,
} from "../schemas/items.schema";
import { ApiResponse } from "../utils/api-response";

const prisma = new PrismaClient();

// GET /api/items - List all items
export async function getAll(req: Request, res: Response) {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    });
    ApiResponse.success(res, StatusCodes.OK, items);
  } catch (error) {
    console.error("Error fetching items:", error);
    ApiResponse.internalError(res, "Failed to fetch items");
  }
}

// GET /api/items/:id - Get single item
export async function getById(req: Request, res: Response) {
  try {
    const params = itemIdSchema.safeParse(req.params);
    if (!params.success) {
      return ApiResponse.validationError(res, params.error);
    }

    const item = await prisma.item.findUnique({
      where: { id: params.data.id },
    });
    if (!item) {
      return ApiResponse.notFound(res, "Item not found");
    }
    ApiResponse.success(res, StatusCodes.OK, item);
  } catch (error) {
    console.error("Error fetching item:", error);
    ApiResponse.internalError(res, "Failed to fetch item");
  }
}

// POST /api/items - Create an item
export async function create(req: Request, res: Response) {
  try {
    const body = createItemSchema.safeParse(req.body);
    if (!body.success) {
      return ApiResponse.validationError(res, body.error);
    }

    const item = await prisma.item.create({
      data: { name: body.data.name },
    });
    ApiResponse.success(res, StatusCodes.CREATED, item, "Item created successfully");
  } catch (error) {
    console.error("Error creating item:", error);
    ApiResponse.internalError(res, "Failed to create item");
  }
}

// PUT /api/items/:id - Update item
export async function update(req: Request, res: Response) {
  try {
    const params = itemIdSchema.safeParse(req.params);
    if (!params.success) {
      return ApiResponse.validationError(res, params.error);
    }

    const body = updateItemSchema.safeParse(req.body);
    if (!body.success) {
      return ApiResponse.validationError(res, body.error);
    }

    const item = await prisma.item.update({
      where: { id: params.data.id },
      data: { name: body.data.name },
    });
    ApiResponse.success(res, StatusCodes.OK, item, "Item updated successfully");
  } catch (error) {
    console.error("Error updating item:", error);
    ApiResponse.internalError(res, "Failed to update item");
  }
}

// DELETE /api/items/:id - Delete item
export async function remove(req: Request, res: Response) {
  try {
    const params = itemIdSchema.safeParse(req.params);
    if (!params.success) {
      return ApiResponse.validationError(res, params.error);
    }

    await prisma.item.delete({
      where: { id: params.data.id },
    });
    ApiResponse.success(res, StatusCodes.OK, null, "Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
    ApiResponse.internalError(res, "Failed to delete item");
  }
}
