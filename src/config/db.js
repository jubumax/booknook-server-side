import { MongoClient } from "mongodb";
import { env } from "./env.js";

let dbPromise;

async function ensureIndexes(db) {
  await db.collection("books").createIndexes([
    { key: { createdAt: -1 } },
    { key: { "addedBy.email": 1, createdAt: -1 } },
  ]);

  await db.collection("borrows").createIndexes([
    { key: { bookId: 1, userEmail: 1 }, unique: true },
    { key: { userEmail: 1, borrowDate: -1 } },
  ]);
}


export function getDb() {
    if (!dbPromise) {
        if (!env.mongoUri) {
            throw new Error("MONGODB_URI is missing. Add it to your .env file.");
        }

        dbPromise = new MongoClient(env.mongoUri)
            .connect()
            .then(async (client) => {
                const db = client.db(env.mongoDbName);

                try {
                    await ensureIndexes(db);
                } catch (error) {
                    console.error("Could not create indexes:", error.message);
                }

                return db;
            })
            .catch((error) => {
                dbPromise = undefined;
                throw error;
            });
    }

    return dbPromise;
}


export async function getCollections() {
    const db = await getDb();

    return {
        books: db.collection("books"),
        borrows: db.collection("borrows"),
    };
}