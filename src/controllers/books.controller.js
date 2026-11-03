import { getCollections } from "../config/db.js";
import { authenticate } from "../middleware/verifyToken.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";

const MAX_BOOKS = 1000;

function parseLimit(value) {
    if (value === undefined) return MAX_BOOKS;

    const limit = Number(value);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw ApiError.badRequest("limit must be a whole number between 1 and 100.");
    }

    return limit;
}


/**
 * GET /books
 * ?sort=newest|oldest   (default: newest)
 * ?limit=6              (Needs in Home > New Arrivals)
 * ?mine=true            (Only for logged in user > needs book, token)
 */
export async function listBooks(req, res) {
    const { books } = await getCollections();

    const filter = {};
    if (req.query.mine === "true") {
        const user = await authenticate(req);
        filter["addedBy.email"] = user.email;
    }

    const direction = req.query.sort === "oldest" ? 1 : -1;
    const limit = parseLimit(req.query.limit);

    const result = await books
        .find(filter)
        .sort({ createdAt: direction, _id: direction })
        .limit(limit)
        .toArray();

    res.json(result);
}


export async function getBook(req, res) {
    const { books } = await getCollections();

    const book = await books.findOne({ _id: toObjectId(req.params.id, "Book") });
    if (!book) throw ApiError.notFound("Book not found.");

    res.json(book);
}