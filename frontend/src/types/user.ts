export interface User {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token?: string;
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface AuthResponse {
  user: User;
}