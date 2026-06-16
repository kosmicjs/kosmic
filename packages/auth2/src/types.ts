export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  hash: string;
  is_active: boolean;
}

export interface Session {
  key: string;
  value: string;
}

export interface ApiKey {
  id: number;
  user_id: number;
  key_prefix: string;
  key_hash: string;
  is_active: boolean;
  expires_at?: Date;
  last_used_at?: Date;
}

export interface AuthDatabase {
  users: User;
  sessions: Session;
  api_keys: ApiKey;
}
