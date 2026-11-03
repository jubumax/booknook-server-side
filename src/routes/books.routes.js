import { Router } from "express";
import { getBook, listBooks } from "../controllers/books.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get("/", listBooks);
router.get("/:id", verifyToken, getBook);

export default router;