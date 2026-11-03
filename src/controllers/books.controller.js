import { getCollections } from "../config/db.js";
import { authenticate } from "../middleware/verifyToken.js";
import { ApiError } from "../utils/ApiError.js";
import { parseBookInput } from "../utils/bookValidation.js";
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


export async function createBook(req, res) {
    const data = parseBookInput(req.body);
    const { books } = await getCollections();

    const now = new Date();
    const book = {
        ...data,
        availableCopies: data.totalCopies,
        addedBy: {
            id: req.user.id,
            name: req.user.name || req.user.email.split("@")[0],
            email: req.user.email,
        },
        createdAt: now,
        updatedAt: now,
    };

    await books.insertOne(book);

    res.status(201).json(book);
}


// Verify both whether the book exists and whether it belongs to this user
async function findOwnedBook(id, user, action) {
    const { books } = await getCollections();

    const book = await books.findOne({ _id: toObjectId(id, "Book") });
    if (!book) throw ApiError.notFound("Book not found.");

    if (book.addedBy?.email !== user.email) {
        throw ApiError.forbidden(`You can only ${action} books you added.`);
    }

    return book;
}


export async function updateBook(req, res) {
    const data = parseBookInput(req.body, { partial: true });
    const book = await findOwnedBook(req.params.id, req.user, "edit");
    const { books } = await getCollections();

    const filter = { _id: book._id, "addedBy.email": req.user.email };
    const update = { $set: { ...data, updatedAt: new Date() } };

    let delta = 0;

    if (data.totalCopies !== undefined) {
        delta = data.totalCopies - book.totalCopies;
        update.$inc = { availableCopies: delta };

        filter.totalCopies = book.totalCopies;
        if (delta < 0) filter.availableCopies = { $gte: -delta };
    }

    const updated = await books.findOneAndUpdate(filter, update, {
        returnDocument: "after",
    });

    if (!updated) {
        if (delta < 0) {
            const borrowed = book.totalCopies - book.availableCopies;
            throw ApiError.conflict(
                `${borrowed} ${borrowed === 1 ? "copy is" : "copies are"} currently borrowed, so total copies cannot go below ${borrowed}.`,
            );
        }
        throw ApiError.conflict("This book was just changed. Please try again.");
    }

    res.json(updated);
}


export async function deleteBook(req, res) {
    const book = await findOwnedBook(req.params.id, req.user, "delete");
    const { books } = await getCollections();

    await books.deleteOne({ _id: book._id, "addedBy.email": req.user.email });

    res.json({ message: "Book deleted successfully." });
}