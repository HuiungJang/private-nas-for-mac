export interface User {
  id: string;
  username: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
}
