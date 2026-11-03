import cors from "cors";
import express from "express";
import { getDb } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { verifyToken } from "./middleware/verifyToken.js";

const app = express();

app.use(
    cors({
        origin: env.clientUrls,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400,
    }),
);
app.use(express.json({ limit: "1mb" }));


app.get("/", (req, res) => {
    res.json({ name: "BookNook API", status: "running" });
});

app.get("/health", async (req, res) => {
    const db = await getDb();
    await db.command({ ping: 1 });

    res.json({ ok: true, database: "connected", uptime: process.uptime() });
});


app.get("/me", verifyToken, (req, res) => {
    res.json(req.user);
});

app.use(notFound);
app.use(errorHandler);

export default app;