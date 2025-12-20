export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  user_id: number;
  pledge_amount: number;
  created_at: string;
}

export interface Comment {
  id: number;
  idea_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface IdeaWithUser extends Idea {
  user_name: string;
  user_email: string;
  comment_count: number;
}

export interface CommentWithUser extends Comment {
  user_name: string;
}

// DTOs (Data Transfer Objects)
export interface UserDTO {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  pledge_amount?: number;
}

export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  pledge_amount?: number;
}

export interface CreateCommentRequest {
  content: string;
}
