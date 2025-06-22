import { Application, Router } from "oak/mod.ts";
import { oakCors } from "cors/mod.ts";

const app = new Application();
const router = new Router();

// Enable CORS for all routes (adjust origin as needed)
app.use(oakCors({ origin: "*" }));

// A simple in-memory list of ideas
interface Idea {
  id: number;
  title: string;
  description: string;
}
const ideas: Idea[] = [];

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

console.log("📡 Backend listening on http://localhost:8000");
await app.listen({ port: 8000 });
