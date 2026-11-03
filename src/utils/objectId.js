import { ObjectId } from "mongodb";
import { ApiError } from "./ApiError.js";

export function toObjectId(id, label = "Item") {
    
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
        throw ApiError.notFound(`${label} not found.`);
    }

    return new ObjectId(id);
}