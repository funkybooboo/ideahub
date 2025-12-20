import { Application, Router } from "oak/mod.ts";
import { oakCors } from "cors/mod.ts";
import { initDatabase } from "./db/database.ts";
import * as users from "./db/users.ts";
import * as ideas from "./db/ideas.ts";
import * as comments from "./db/comments.ts";
import { generateToken } from "./auth/jwt.ts";
import { authMiddleware, AuthState } from "./middleware/auth.ts";
import type {
  CreateIdeaRequest,
  LoginRequest,
  RegisterRequest,
  UpdateIdeaRequest,
  CreateCommentRequest,
} from "./types.ts";

/**
 * Factory that returns a fresh Application instance
 * with all routes wired up - for production or testing.
 */
export function createApp(): Application {
  const app = new Application();
  const router = new Router<AuthState>();

  // Enable CORS
  const corsOrigin = Deno.env.get("CORS_ORIGIN") || "*";
  app.use(oakCors({ origin: corsOrigin }));

  // Auth Routes
  router
    .post("/api/auth/register", async (ctx) => {
      try {
        const body = await ctx.request.body({ type: "json" }).value as RegisterRequest;

        if (!body.email || !body.password || !body.name) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Missing required fields" };
          return;
        }

        const existing = users.getUserByEmail(body.email);
        if (existing) {
          ctx.response.status = 409;
          ctx.response.body = { error: "User already exists" };
          return;
        }

        const userId = users.createUser(body.email, body.password, body.name);
        const token = await generateToken(userId, body.email);
        const user = users.getUserById(userId);

        if (!user) {
          ctx.response.status = 500;
          ctx.response.body = { error: "Failed to create user" };
          return;
        }

        ctx.response.status = 201;
        ctx.response.body = { token, user: users.userToDTO(user) };
      } catch (error) {
        console.error("Register error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .post("/api/auth/login", async (ctx) => {
      try {
        const body = await ctx.request.body({ type: "json" }).value as LoginRequest;

        if (!body.email || !body.password) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Missing email or password" };
          return;
        }

        const user = users.getUserByEmail(body.email);
        if (!user || !users.verifyPassword(body.password, user.password_hash)) {
          ctx.response.status = 401;
          ctx.response.body = { error: "Invalid credentials" };
          return;
        }

        const token = await generateToken(user.id, user.email);
        ctx.response.body = { token, user: users.userToDTO(user) };
      } catch (error) {
        console.error("Login error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    });

  // Ideas Routes
  router
    .get("/api/ideas", (ctx) => {
      try {
        const query = ctx.request.url.searchParams.get("q");
        const allIdeas = query ? ideas.searchIdeas(query) : ideas.getAllIdeas();
        ctx.response.body = allIdeas;
      } catch (error) {
        console.error("Get ideas error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .get("/api/ideas/:id", (ctx) => {
      try {
        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid idea ID" };
          return;
        }

        const idea = ideas.getIdeaById(id);
        if (!idea) {
          ctx.response.status = 404;
          ctx.response.body = { error: "Idea not found" };
          return;
        }

        const ideaComments = comments.getCommentsByIdeaId(id);
        ctx.response.body = { ...idea, comments: ideaComments };
      } catch (error) {
        console.error("Get idea error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .post("/api/ideas", authMiddleware, async (ctx) => {
      try {
        const body = await ctx.request.body({ type: "json" }).value as CreateIdeaRequest;

        if (!body.title || !body.description) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Missing title or description" };
          return;
        }

        const pledgeAmount = body.pledge_amount || 0;
        const ideaId = ideas.createIdea(body.title, body.description, ctx.state.userId!, pledgeAmount);
        const newIdea = ideas.getIdeaById(ideaId);

        ctx.response.status = 201;
        ctx.response.body = newIdea;
      } catch (error) {
        console.error("Create idea error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .put("/api/ideas/:id", authMiddleware, async (ctx) => {
      try {
        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid idea ID" };
          return;
        }

        const idea = ideas.getIdeaById(id);
        if (!idea) {
          ctx.response.status = 404;
          ctx.response.body = { error: "Idea not found" };
          return;
        }

        if (idea.user_id !== ctx.state.userId) {
          ctx.response.status = 403;
          ctx.response.body = { error: "Not authorized" };
          return;
        }

        const body = await ctx.request.body({ type: "json" }).value as UpdateIdeaRequest;
        ideas.updateIdea(id, body);

        const updated = ideas.getIdeaById(id);
        ctx.response.body = updated;
      } catch (error) {
        console.error("Update idea error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .delete("/api/ideas/:id", authMiddleware, (ctx) => {
      try {
        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid idea ID" };
          return;
        }

        const idea = ideas.getIdeaById(id);
        if (!idea) {
          ctx.response.status = 404;
          ctx.response.body = { error: "Idea not found" };
          return;
        }

        if (idea.user_id !== ctx.state.userId) {
          ctx.response.status = 403;
          ctx.response.body = { error: "Not authorized" };
          return;
        }

        ideas.deleteIdea(id);
        ctx.response.status = 204;
      } catch (error) {
        console.error("Delete idea error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    });

  // Comments Routes
  router
    .post("/api/ideas/:id/comments", authMiddleware, async (ctx) => {
      try {
        const ideaId = parseInt(ctx.params.id);
        if (isNaN(ideaId)) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid idea ID" };
          return;
        }

        const idea = ideas.getIdeaById(ideaId);
        if (!idea) {
          ctx.response.status = 404;
          ctx.response.body = { error: "Idea not found" };
          return;
        }

        const body = await ctx.request.body({ type: "json" }).value as CreateCommentRequest;
        if (!body.content) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Missing content" };
          return;
        }

        const commentId = comments.createComment(ideaId, ctx.state.userId!, body.content);

        ctx.response.status = 201;
        ctx.response.body = { id: commentId };
      } catch (error) {
        console.error("Create comment error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .delete("/api/comments/:id", authMiddleware, (ctx) => {
      try {
        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid comment ID" };
          return;
        }

        const comment = comments.getCommentById(id);
        if (!comment) {
          ctx.response.status = 404;
          ctx.response.body = { error: "Comment not found" };
          return;
        }

        if (comment.user_id !== ctx.state.userId) {
          ctx.response.status = 403;
          ctx.response.body = { error: "Not authorized" };
          return;
        }

        comments.deleteComment(id);
        ctx.response.status = 204;
      } catch (error) {
        console.error("Delete comment error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    });

  // User Routes
  router
    .get("/api/users/me", authMiddleware, (ctx) => {
      try {
        const user = users.getUserById(ctx.state.userId!);
        if (!user) {
          ctx.response.status = 404;
          ctx.response.body = { error: "User not found" };
          return;
        }

        ctx.response.body = users.userToDTO(user);
      } catch (error) {
        console.error("Get user error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    })
    .get("/api/users/me/ideas", authMiddleware, (ctx) => {
      try {
        const userIdeas = ideas.getIdeasByUserId(ctx.state.userId!);
        ctx.response.body = userIdeas;
      } catch (error) {
        console.error("Get user ideas error:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
      }
    });

  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

// If run directly (deno run), start the server:
if (import.meta.main) {
  // Initialize database
  initDatabase();

  const app = createApp();
  const port = parseInt(Deno.env.get("PORT") || "8000");
  console.log(`Backend listening on http://localhost:${port}`);
  await app.listen({ port });
}
