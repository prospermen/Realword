export interface CommentAuthor {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface CommentResponse {
  id: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthor;
}
