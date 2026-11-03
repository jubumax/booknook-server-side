import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// if route doesn't match
export function notFound(req, res, next) {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} was not found.`));
}

const DATABASE_ERRORS = new Set([
    "MongoServerSelectionError",
    "MongoNetworkError",
    "MongoNetworkTimeoutError",
]);


// all errors are goes by this section to client, same format!
export function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);

    let status = 500;
    let message = "Something went wrong on the server. Please try again.";

    if (error instanceof ApiError) {
        status = error.status;
        message = error.message;
    } else if (error.type === "entity.parse.failed") {
        status = 400;
        message = "The request body is not valid JSON.";
    } else if (error.type === "entity.too.large") {
        status = 413;
        message = "The request body is too large.";
    } else if (DATABASE_ERRORS.has(error.name)) {
        status = 503;
        message = "The database is unavailable right now. Please try again shortly.";
    } else if (error.code === 11000) {
        status = 409;
        message = "This record already exists.";
    }

    // only for server's own error
    if (status >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, error);
    }

    res.status(status).json({
        message,
        ...(env.nodeEnv === "development" && status >= 500
            ? { detail: error.message }
            : {}),
    });
}