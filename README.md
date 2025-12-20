# IdeaHub

**A simple place to share ideas and talk them through with others.**

Got an idea for a project? A bug that needs fixing? Looking for collaborators or want to help someone else? Share it here. IdeaHub is designed to connect people - those with ideas and those who can bring them to life.

Browse ideas, join discussions, and optionally offer bounties for implementation. No complex features, no friction - just ideas and conversations.

## Quick Start

```bash
docker compose up
```

Visit http://localhost:3000

## How It Works

1. **Browse freely** - Anyone can view all ideas and discussions without signing in
2. **Search easily** - Simple fuzzy search finds ideas by keyword
3. **Discuss openly** - Click any idea to expand the conversation
4. **Contribute simply** - Sign in only when you want to share an idea or comment
5. **Pledge optionally** - Add a bounty to attract developers (bug bounties, feature requests, etc.)

## Use Cases

- Share project ideas and find collaborators
- Post bug bounties with pledged amounts
- Discuss feature requests
- Connect developers with non-technical founders
- Brainstorm solutions together
- Find interesting problems to solve

## Why IdeaHub?

**Simple.** No profiles to set up, no complex features, no learning curve. Just ideas and conversations.

**Open.** Everything is visible to everyone. No hidden content, no paywalls, no private groups.

**Focused.** One purpose: connect people around ideas. No notifications, no feeds, no distractions.

## Tech Stack

- **Backend**: Deno, Oak, SQLite
- **Frontend**: React, TypeScript, Marked (Markdown)
- **Markdown**: Full markdown support in ideas and comments
- **Storage**: SQLite database with Docker volume persistence

## Setup

### Configuration

Environment files with defaults are included. To customize:

**Backend** (`backend/.env`):
- `PORT` - Server port (default: 8000)
- `DB_PATH` - Database file path (default: data/ideahub.db)
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `CORS_ORIGIN` - CORS allowed origins (default: *)

### Docker

```bash
docker compose up
```

### Manual

**Backend:**
```bash
cd backend
deno task start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API

**Auth:**
- `POST /api/auth/register` - Register user (email, password, name)
- `POST /api/auth/login` - Login (email, password)

**Ideas:**
- `GET /api/ideas` - List all ideas
- `GET /api/ideas?q=search` - Search ideas by title or description
- `GET /api/ideas/:id` - Get idea with comments
- `POST /api/ideas` - Create idea (auth required, supports title, description, pledge_amount)
- `PUT /api/ideas/:id` - Update idea (owner only)
- `DELETE /api/ideas/:id` - Delete idea (owner only)

**Comments:**
- `POST /api/ideas/:id/comments` - Add comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (owner only)

**User:**
- `GET /api/users/me` - Get current user (auth required)
- `GET /api/users/me/ideas` - Get user's ideas (auth required)

## License

GNU General Public License v3.0
