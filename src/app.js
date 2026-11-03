import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { getDb } from "./config/db.js";

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


export default app;