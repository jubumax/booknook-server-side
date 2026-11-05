# 📚 BookNook API

The backend for **BookNook**, a small online library where people add books, borrow them for a few days, and return them when they are done.

- **Live API:** https://booknook-server-side.vercel.app/
- **Live site:** https://booknook-jubumax.vercel.app
- **Client repo:** https://booknook-jubumax.vercel.app

## Key Features

- Anyone can browse the shelf. Logging in unlocks the rest.
- Readers can add books, edit them, and delete the ones they added. Nobody else can touch them.
- Borrowing a book takes one copy off the shelf. Returning it puts the copy back.
- You can't borrow the same book twice, and you can't borrow a book that has no copies left.

## Technologies Used

Node.js 22, Express 5, MongoDB (the official driver) and [jose](https://github.com/panva/jose) for verifying tokens.

There is no login code in this repo. Accounts and sessions live in the Next.js client (BetterAuth). This API only checks that a request really comes from a logged in user.

## Project Structure

```
src/
├── config/             env, database connection, constants
├── controllers/        books and borrows logic
├── middleware/         JWT verification, error handling
├── routes/             route definitions
├── utils/              validation, ApiError, id parsing
├── app.js              the Express app
└── index.js            starts the server locally
```

## Highlights

- **Copies never go below zero.** Checking for a free copy and taking it happen in one database operation, so two people grabbing the last copy at the same moment can't both win.
- **No double borrowing, even in a race.** A unique index on `(bookId, userEmail)` backs up the check in code.
- **The server decides who and when.** The owner and the dates come from the token and the server clock, never from the request body. Only a fixed list of fields is accepted when adding or editing a book.
- **Editing total copies keeps the count honest.** If 2 of 5 copies are out, you can't drop the total below 2.
- **Bad ids don't crash anything.** A made-up id gets a clean "not found", not a 500.


## How login works here

1. A user signs up or logs in on the client.
2. Before each protected request, the client asks BetterAuth for a short-lived JWT and sends it as `Authorization: Bearer <token>`.
3. The API verifies the token's signature using the public keys the client publishes at `/api/auth/jwks`, and checks the issuer and audience.
4. If it is valid, the user's id, name and email are available as `req.user`.

No passwords or sessions are stored in this API, and the token's owner is the only identity it trusts.

## Getting Started

You will need Node.js 20 or newer and a MongoDB database (a free Atlas cluster works).

```bash
git clone https://github.com/jubumax/booknook-server-side.git
cd booknook-server-side
npm install
cp .env.example .env        # then fill in your values
npm run dev
```

The API starts on http://localhost:5000. Try http://localhost:5000/health.

### Environment variables

| Name | What it is |
|---|---|
| `PORT` | Port for local development (default 5000) |
| `CLIENT_URL` | Where the client runs, used for CORS. Separate several with commas |
| `BETTER_AUTH_URL` | The client's URL, where BetterAuth runs. Must match the client's `BETTER_AUTH_URL` exactly |
| `MONGODB_URI` | Your MongoDB connection string |
| `MONGODB_DB` | Database name. Use the same one as the client |

## Deploying

The project is deployed on Vercel with no extra config. Vercel finds `src/app.js` on its own. Add the environment variables above in the project settings, set `CLIENT_URL` and `AUTH_BASE_URL` to the live client URL, and allow Vercel to reach your database (in Atlas, Network Access, allow `0.0.0.0/0`).


<!-- ## What would be added next

- Search and pagination on the book list
- Rate limiting
- Automated tests for the borrow and return flow
- Email reminders for books that are overdue
 -->
---

© 2026 BookNook — [@jubumax](https://www.linkedin.com/in/jubumax) • All rights reserved
