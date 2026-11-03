import { Router } from "express";
import booksRoutes from "./books.routes.js";
import borrowsRoutes from "./borrows.routes.js";

const router = Router();

router.use("/books", booksRoutes);
router.use("/borrows", borrowsRoutes);

export default router;