export interface CommentAuthor {
  username: string;
  bio: string | null;
  image: string | null;
  following?: boolean;
}

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: CommentAuthor;
}

export interface CommentListResponse {
  comments: Comment[];
}

export interface SingleCommentResponse {
  comment: Comment;
}
