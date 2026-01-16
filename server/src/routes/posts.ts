import { Router } from "express";
import * as postsController from "../controllers/posts.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", postsController.getAll);
router.post("/", authMiddleware, postsController.create);
router.patch("/:id/like", authMiddleware, postsController.like);

export default router;
