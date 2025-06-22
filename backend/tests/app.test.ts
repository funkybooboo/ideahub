// — Monkey-patch for SuperDeno in Deno 2 —
// we need a global `window` so SuperDeno’s SHAM_SYMBOL plumbing works.
// deno-lint-ignore no-explicit-any
(globalThis as any).window = globalThis;

import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { superoak } from "https://deno.land/x/superoak@4.8.0/mod.ts";
import { createApp, Idea } from "../src/mod.ts";

Deno.test("GET /api/ideas → 200 & empty list", async () => {
  const client = await superoak(createApp());
  const res = await client.get("/api/ideas").expect(200);
  assertEquals(res.body, [] as Idea[]);
});

Deno.test("POST + GET /api/ideas → persists across requests", async () => {
  const app = createApp();

  const poster = await superoak(app);
  const payload = { title: "Foo", description: "Bar" };
  const postRes = await poster
    .post("/api/ideas")
    .send(payload)
    .expect(201);
  assertEquals(postRes.body, { id: 1, ...payload });

  const getter = await superoak(app);
  const getRes = await getter.get("/api/ideas").expect(200);
  assertEquals(getRes.body, [{ id: 1, ...payload }]);
});

Deno.test("Unknown routes give 404", async () => {
  const client = await superoak(createApp());
  await client.get("/does-not-exist").expect(404);
});
