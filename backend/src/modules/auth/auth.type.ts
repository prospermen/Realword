// 注册请求体
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

// 登录请求体
export interface LoginInput {
  email: string;
  password: string;
}

// 返回给前端的用户信息（包含 token，不含密码）
export interface AuthUser {
  username: string;
  email: string;
  token: string;
  bio: string | null;
  image: string | null;
}
