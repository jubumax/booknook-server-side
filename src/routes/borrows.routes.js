import { Router } from "express";
import { borrowBook } from "../controllers/borrows.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.post("/", verifyToken, borrowBook);

export default router;