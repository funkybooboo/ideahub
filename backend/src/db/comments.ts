import db from "./database.ts";
import { Comment, CommentWithUser } from "../types.ts";

export function createComment(
  ideaId: number,
  userId: number,
  content: string,
): number {
  const stmt = db.prepare(
    "INSERT INTO comments (idea_id, user_id, content) VALUES (?, ?, ?)",
  );
  stmt.run(ideaId, userId, content);
  stmt.finalize();

  return db.prepare("SELECT last_insert_rowid()").value<[number]>()![0];
}

export function getCommentsByIdeaId(ideaId: number): CommentWithUser[] {
  const stmt = db.prepare(`
    SELECT
      comments.*,
      users.name as user_name
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.idea_id = ?
    ORDER BY comments.created_at DESC
  `);
  const rows = stmt.all<CommentWithUser>(ideaId);
  stmt.finalize();
  return rows;
}

export function deleteComment(id: number): boolean {
  const stmt = db.prepare("DELETE FROM comments WHERE id = ?");
  stmt.run(id);
  const changes = db.changes;
  stmt.finalize();
  return changes > 0;
}

export function getCommentById(id: number): Comment | null {
  const stmt = db.prepare("SELECT * FROM comments WHERE id = ?");
  const row = stmt.get<Comment>(id);
  stmt.finalize();
  return row || null;
}
