import { Router } from "express";
import {
    createBook,
    getBook,
    listBooks,
} from "../controllers/books.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get("/", listBooks);
router.post("/", verifyToken, createBook);
router.get("/:id", verifyToken, getBook);

export default router;