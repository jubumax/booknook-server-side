import { ApiError } from "./ApiError.js";

export const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

const LABELS = {
    title: "Title",
    author: "Author name",
    category: "Category",
    image: "Book image",
    description: "Description",
    totalCopies: "Total copies",
};


const isPlainObject = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

function parseText(value, label, min, max) {
    if (typeof value !== "string") {
        throw ApiError.badRequest(`${label} must be text.`);
    }

    const text = value.trim();
    if (text.length < min) {
        throw ApiError.badRequest(`${label} must be at least ${min} characters.`);
    }
    if (text.length > max) {
        throw ApiError.badRequest(`${label} can be at most ${max} characters.`);
    }

    return text;
}

function parseCategory(value) {
    if (!CATEGORIES.includes(value)) {
        throw ApiError.badRequest(`Category must be one of: ${CATEGORIES.join(", ")}.`);
    }
    return value;
}

function parseImage(value) {
    if (typeof value !== "string" || value.length > 2048) {
        throw ApiError.badRequest("Book image must be a valid image URL.");
    }

    try {
        const url = new URL(value.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
        return url.toString();
    } catch {
        throw ApiError.badRequest("Book image must be a valid image URL.");
    }
}

function parseCopies(value) {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
        throw ApiError.badRequest("Total copies must be a whole number between 1 and 100.");
    }
    return value;
}


const PARSERS = {
    title: (value) => parseText(value, "Title", 2, 120),
    author: (value) => parseText(value, "Author name", 2, 100),
    category: parseCategory,
    image: parseImage,
    description: (value) => parseText(value, "Description", 10, 500),
    totalCopies: parseCopies,
};

export function parseBookInput(body, { partial = false } = {}) {
    if (!isPlainObject(body)) {
        throw ApiError.badRequest("Send the book details as a JSON object.");
    }

    const data = {};

    for (const [field, parse] of Object.entries(PARSERS)) {
        if (body[field] === undefined) {
            if (!partial) throw ApiError.badRequest(`${LABELS[field]} is required.`);
            continue;
        }
        data[field] = parse(body[field]);
    }

    if (partial && Object.keys(data).length === 0) {
        throw ApiError.badRequest("Send at least one field to update.");
    }

    return data;
}