import { Context, Next } from "oak/mod.ts";
import { verifyToken } from "../auth/jwt.ts";

export interface AuthState {
  userId?: number;
  userEmail?: string;
}

export async function authMiddleware(
  ctx: Context<AuthState>,
  next: Next,
) {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Missing or invalid authorization header" };
    return;
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid or expired token" };
    return;
  }

  ctx.state.userId = payload.userId;
  ctx.state.userEmail = payload.email;

  await next();
}

export async function optionalAuthMiddleware(
  ctx: Context<AuthState>,
  next: Next,
) {
  const authHeader = ctx.request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (payload) {
      ctx.state.userId = payload.userId;
      ctx.state.userEmail = payload.email;
    }
  }

  await next();
}
