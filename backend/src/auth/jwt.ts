import { create, verify } from "djwt";

const SECRET_KEY = Deno.env.get("JWT_SECRET") || "your-secret-key-change-this-in-production";

const encoder = new TextEncoder();
const keyData = encoder.encode(SECRET_KEY);

async function getKey() {
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function generateToken(userId: number, email: string): Promise<string> {
  const key = await getKey();

  return await create(
    { alg: "HS256", typ: "JWT" },
    {
      userId,
      email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    },
    key,
  );
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
  try {
    const key = await getKey();
    const payload = await verify(token, key);

    return {
      userId: payload.userId as number,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
