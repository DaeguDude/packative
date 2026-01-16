import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
