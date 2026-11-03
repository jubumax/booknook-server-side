import { MongoClient } from "mongodb";
import { env } from "./env.js";

let dbPromise;

export function getDb() {
    if (!dbPromise) {
        if (!env.mongoUri) {
            throw new Error("MONGODB_URI is missing. Add it to your .env file.");
        }

        dbPromise = new MongoClient(env.mongoUri)
            .connect()
            .then((client) => client.db(env.mongoDbName))
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