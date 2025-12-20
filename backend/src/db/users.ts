import db from "./database.ts";
import { User, UserDTO } from "../types.ts";
import * as bcrypt from "bcrypt";

export function createUser(
  email: string,
  password: string,
  name: string,
): number {
  const passwordHash = bcrypt.hashSync(password);

  const stmt = db.prepare(
    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
  );
  stmt.run(email, passwordHash, name);
  stmt.finalize();

  return db.prepare("SELECT last_insert_rowid()").value<[number]>()![0];
}

export function getUserByEmail(email: string): User | null {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  const row = stmt.get<User>(email);
  stmt.finalize();
  return row || null;
}

export function getUserById(id: number): User | null {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const row = stmt.get<User>(id);
  stmt.finalize();
  return row || null;
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at,
  };
}
