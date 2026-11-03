import "dotenv/config";

const parseList = (value) =>
    (value ?? "")
        .split(",")
        .map((item) => item.trim().replace(/\/$/, ""))
        .filter(Boolean);

const clientUrls = parseList(process.env.CLIENT_URL);

export const env = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrls: clientUrls.length > 0 ? clientUrls : ["http://localhost:3000"],
    mongoUri: process.env.MONGODB_URI,
    mongoDbName: process.env.MONGODB_DB || "booknook",
};