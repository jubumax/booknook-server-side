import { BORROW_DAYS, DAY_MS } from "../config/constants.js";
import { getCollections } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { toObjectId } from "../utils/objectId.js";


export async function borrowBook(req, res) {
    if (typeof req.body?.bookId !== "string") {
        throw ApiError.badRequest("bookId is required.");
    }

    const bookId = toObjectId(req.body.bookId, "Book");
    const { books, borrows } = await getCollections();
    const { email, name } = req.user;

    const book = await books.findOne({ _id: bookId });
    if (!book) throw ApiError.notFound("Book not found.");

    // same book cannot be taken twice
    const alreadyBorrowed = await borrows.findOne(
        { bookId, userEmail: email },
        { projection: { _id: 1 } },
    );
    if (alreadyBorrowed) {
        throw ApiError.conflict("You have already borrowed this book.");
    }

    // for last copy, if two people press button at the same time, only one will get it
    const reserved = await books.findOneAndUpdate(
        { _id: bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1 } },
    );
    if (!reserved) {
        throw ApiError.conflict("Sorry, no copies of this book are available right now.");
    }


    const now = new Date();
    const borrow = {
        bookId,
        bookTitle: book.title,
        bookImage: book.image,
        userEmail: email,
        userName: name || email.split("@")[0],
        borrowDate: now,
        returnDate: new Date(now.getTime() + BORROW_DAYS * DAY_MS),
    };


    try {
        await borrows.insertOne(borrow);
    } catch (error) {
        await books.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });

        if (error.code === 11000) {
            throw ApiError.conflict("You have already borrowed this book.");
        }
        throw error;
    }

    res.status(201).json(borrow);
}


export async function listMyBorrows(req, res) {
    const { borrows } = await getCollections();

    const result = await borrows
        .find({ userEmail: req.user.email })
        .sort({ borrowDate: -1, _id: -1 })
        .toArray();

    res.json(result);
}


export async function returnBorrowedBook(req, res) {
    const { books, borrows } = await getCollections();
    const borrowId = toObjectId(req.params.id, "Borrow");

    const borrow = await borrows.findOne({ _id: borrowId });
    if (!borrow) throw ApiError.notFound("Borrow record not found.");

    if (borrow.userEmail !== req.user.email) {
        throw ApiError.forbidden("You can only return books you borrowed.");
    }


    const removed = await borrows.findOneAndDelete({
        _id: borrowId,
        userEmail: req.user.email,
    });
    if (!removed) {
        throw ApiError.notFound("This book has already been returned.");
    }


    await books.updateOne(
        { _id: removed.bookId },
        { $inc: { availableCopies: 1 } },
    );

    res.json({ message: "Book returned successfully." });
}