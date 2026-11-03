import app from "./app.js";
import { getDb } from "./config/db.js";
import { env } from "./config/env.js";


try {
    await getDb();
    console.log("MongoDB connected");
} catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
}


app.listen(env.port, () => {
    console.log(`BookNook API running on http://localhost:${env.port}`);
});