export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }

    static badRequest(message = "Invalid request.") {
        return new ApiError(400, message);
    }

    static unauthorized(message = "Please log in to continue.") {
        return new ApiError(401, message);
    }

    static forbidden(message = "You are not allowed to do this.") {
        return new ApiError(403, message);
    }

    static notFound(message = "Not found.") {
        return new ApiError(404, message);
    }

    static conflict(message = "This action conflicts with existing data.") {
        return new ApiError(409, message);
    }
}