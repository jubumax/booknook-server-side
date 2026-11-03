import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";


const jwks = createRemoteJWKSet(new URL(`${env.authBaseUrl}/api/auth/jwks`));

export async function authenticate(req) {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ");

    if (scheme !== "Bearer" || !token) {
        throw ApiError.unauthorized("Authentication token is missing.");
    }

    let payload;
    try {
        ({ payload } = await jwtVerify(token, jwks, {
            issuer: env.authBaseUrl,
            audience: env.authBaseUrl,
            clockTolerance: 5,
        }));
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            throw ApiError.unauthorized(
                "Your session has expired. Please log in again.",
            );
        }

        // If token has error (signature, issuer, etc)
        if (
            error instanceof errors.JOSEError &&
            !(error instanceof errors.JWKSTimeout)
        ) {
            throw ApiError.unauthorized("Invalid authentication token.");
        }


        console.error("JWT verification failed:", error);
        throw new ApiError(
            503,
            "Could not verify your login right now. Please try again.",
        );
    }

    const id = payload.id ?? payload.sub;
    if (!id || !payload.email) {
        throw ApiError.unauthorized("Invalid authentication token.");
    }

    return { id, email: payload.email, name: payload.name ?? "" };
}


export async function verifyToken(req, res, next) {
    req.user = await authenticate(req);
    next();
}