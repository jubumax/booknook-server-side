import { Router } from "express";
import {
    createBook,
    deleteBook,
    getBook,
    listBooks,
    updateBook,
} from "../controllers/books.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get("/", listBooks);
router.post("/", verifyToken, createBook);
router.get("/:id", verifyToken, getBook);
router.patch("/:id", verifyToken, updateBook);
router.delete("/:id", verifyToken, deleteBook);

export default router;