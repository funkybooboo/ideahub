import { Application, Router } from "oak/mod.ts";
import { oakCors } from "cors/mod.ts";

export interface Idea {
  id: number;
  title: string;
  description: string;
}

/**
 * Factory that returns a fresh Application instance
 * with all routes wired up — for production or testing.
 */
export function createApp(): Application {
  const ideas: Idea[] = [];
  const app = new Application();
  const router = new Router();

  // Enable CORS
  app.use(oakCors({ origin: "*" }));

  // Routes
  router
      .get("/api/ideas", (ctx) => {
        ctx.response.body = ideas;
      })
      .post("/api/ideas", async (ctx) => {
        const body = await ctx.request.body({ type: "json" }).value;
        const newIdea: Idea = { id: ideas.length + 1, ...body };
        ideas.push(newIdea);
        ctx.response.status = 201;
        ctx.response.body = newIdea;
      });

  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

// If run directly (deno run), start the server:
if (import.meta.main) {
  const app = createApp();
  console.log("📡 Backend listening on http://localhost:8000");
  await app.listen({ port: 8000 });
}
