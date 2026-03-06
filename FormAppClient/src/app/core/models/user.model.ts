export interface JwtPayload {
  sub: string;
  email: string;
  role: 'admin' | 'user';
  exp: number;
}

export interface User {
  sub: string;
  email: string;
  role: 'admin' | 'user';
}
