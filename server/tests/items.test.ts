import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "./setup";

describe("Items API", () => {
  describe("GET /api/items", () => {
    it("should return empty array when no items exist", async () => {
      const res = await request(app).get("/api/items");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should return all items", async () => {
      await prisma.item.createMany({
        data: [{ name: "Item 1" }, { name: "Item 2" }],
      });

      const res = await request(app).get("/api/items");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("GET /api/items/:id", () => {
    it("should return a single item", async () => {
      const item = await prisma.item.create({ data: { name: "Test Item" } });

      const res = await request(app).get(`/api/items/${item.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Test Item");
    });

    it("should return 404 for non-existent item", async () => {
      const res = await request(app).get("/api/items/99999");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 400 for invalid id format", async () => {
      const res = await request(app).get("/api/items/invalid");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/items", () => {
    it("should create a new item", async () => {
      const res = await request(app)
        .post("/api/items")
        .send({ name: "New Item" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("New Item");
      expect(res.body.message).toBe("Item created successfully");
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app).post("/api/items").send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when name is empty", async () => {
      const res = await request(app).post("/api/items").send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/items/:id", () => {
    it("should update an existing item", async () => {
      const item = await prisma.item.create({ data: { name: "Old Name" } });

      const res = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("New Name");
      expect(res.body.message).toBe("Item updated successfully");
    });

    it("should return 400 when name is invalid", async () => {
      const item = await prisma.item.create({ data: { name: "Test" } });

      const res = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/items/:id", () => {
    it("should delete an existing item", async () => {
      const item = await prisma.item.create({ data: { name: "To Delete" } });

      const res = await request(app).delete(`/api/items/${item.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Item deleted successfully");

      // Verify item is deleted
      const deleted = await prisma.item.findUnique({ where: { id: item.id } });
      expect(deleted).toBeNull();
    });

    it("should return 400 for invalid id format", async () => {
      const res = await request(app).delete("/api/items/invalid");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
