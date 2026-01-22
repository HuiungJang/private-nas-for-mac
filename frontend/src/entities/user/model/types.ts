export interface User {
  id: string;
  username: string;
  roles: string[];
}

export interface UserSummary {
  id: string;
  username: string;
  roles: string[]; // ['ADMIN', 'USER']
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  roles: string[];
}

export interface UpdateUserRequest {
  active: boolean;
  roles: string[];
}