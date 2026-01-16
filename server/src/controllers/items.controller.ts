import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  createItemSchema,
  updateItemSchema,
  itemIdSchema,
} from "../schemas/items.schema";

const prisma = new PrismaClient();

// GET /api/items - List all items
export async function getAll(req: Request, res: Response) {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
}

// GET /api/items/:id - Get single item
export async function getById(req: Request, res: Response) {
  try {
    const params = itemIdSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: params.error.issues[0].message });
    }

    const item = await prisma.item.findUnique({
      where: { id: params.data.id },
    });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
}

// POST /api/items - Create an item
export async function create(req: Request, res: Response) {
  try {
    const body = createItemSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error.issues[0].message });
    }

    const item = await prisma.item.create({
      data: { name: body.data.name },
    });
    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
}

// PUT /api/items/:id - Update item
export async function update(req: Request, res: Response) {
  try {
    const params = itemIdSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: params.error.issues[0].message });
    }

    const body = updateItemSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error.issues[0].message });
    }

    const item = await prisma.item.update({
      where: { id: params.data.id },
      data: { name: body.data.name },
    });
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
}

// DELETE /api/items/:id - Delete item
export async function remove(req: Request, res: Response) {
  try {
    const params = itemIdSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: params.error.issues[0].message });
    }

    await prisma.item.delete({
      where: { id: params.data.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
}
