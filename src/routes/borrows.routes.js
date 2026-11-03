import { Router } from "express";
import {
    borrowBook,
    listMyBorrows,
    returnBorrowedBook,
} from "../controllers/borrows.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.post("/", verifyToken, borrowBook);
router.get("/", verifyToken, listMyBorrows);
router.delete("/:id", verifyToken, returnBorrowedBook);

export default router;