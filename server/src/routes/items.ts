import { Router } from "express";
import * as itemsController from "../controllers/items.controller";

const router = Router();

router.get("/", itemsController.getAll);
router.get("/:id", itemsController.getById);
router.post("/", itemsController.create);
router.put("/:id", itemsController.update);
router.delete("/:id", itemsController.remove);

export default router;
