import db from "./database.ts";
import { Idea, IdeaWithUser } from "../types.ts";

export function createIdea(
  title: string,
  description: string,
  userId: number,
  pledgeAmount: number = 0,
): number {
  const stmt = db.prepare(
    "INSERT INTO ideas (title, description, user_id, pledge_amount) VALUES (?, ?, ?, ?)",
  );
  stmt.run(title, description, userId, pledgeAmount);
  stmt.finalize();

  return db.prepare("SELECT last_insert_rowid()").value<[number]>()![0];
}

export function getAllIdeas(): IdeaWithUser[] {
  const stmt = db.prepare(`
    SELECT
      ideas.*,
      users.name as user_name,
      users.email as user_email,
      (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) as comment_count
    FROM ideas
    JOIN users ON ideas.user_id = users.id
    ORDER BY ideas.created_at DESC
  `);
  const rows = stmt.all<IdeaWithUser>();
  stmt.finalize();
  return rows;
}

export function searchIdeas(query: string): IdeaWithUser[] {
  const searchTerm = `%${query}%`;
  const stmt = db.prepare(`
    SELECT
      ideas.*,
      users.name as user_name,
      users.email as user_email,
      (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) as comment_count
    FROM ideas
    JOIN users ON ideas.user_id = users.id
    WHERE ideas.title LIKE ? OR ideas.description LIKE ?
    ORDER BY ideas.created_at DESC
  `);
  const rows = stmt.all<IdeaWithUser>(searchTerm, searchTerm);
  stmt.finalize();
  return rows;
}

export function getIdeaById(id: number): IdeaWithUser | null {
  const stmt = db.prepare(`
    SELECT
      ideas.*,
      users.name as user_name,
      users.email as user_email,
      (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) as comment_count
    FROM ideas
    JOIN users ON ideas.user_id = users.id
    WHERE ideas.id = ?
  `);
  const row = stmt.get<IdeaWithUser>(id);
  stmt.finalize();
  return row || null;
}

export function getIdeasByUserId(userId: number): IdeaWithUser[] {
  const stmt = db.prepare(`
    SELECT
      ideas.*,
      users.name as user_name,
      users.email as user_email,
      (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) as comment_count
    FROM ideas
    JOIN users ON ideas.user_id = users.id
    WHERE ideas.user_id = ?
    ORDER BY ideas.created_at DESC
  `);
  const rows = stmt.all<IdeaWithUser>(userId);
  stmt.finalize();
  return rows;
}

export function updateIdea(
  id: number,
  updates: { title?: string; description?: string; pledge_amount?: number },
): boolean {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.pledge_amount !== undefined) {
    fields.push("pledge_amount = ?");
    values.push(updates.pledge_amount);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const stmt = db.prepare(
    `UPDATE ideas SET ${fields.join(", ")} WHERE id = ?`,
  );
  stmt.run(...values);
  const changes = db.changes;
  stmt.finalize();

  return changes > 0;
}

export function deleteIdea(id: number): boolean {
  const stmt = db.prepare("DELETE FROM ideas WHERE id = ?");
  stmt.run(id);
  const changes = db.changes;
  stmt.finalize();
  return changes > 0;
}
