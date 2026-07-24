export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  hash: string;
  is_active: boolean;
  is_verified: boolean;
  verification_token?: string;
  verification_token_expires_at?: Date;
  google_access_token?: string;
  google_refresh_token?: string;
  github_access_token?: string;
  github_refresh_token?: string;
}

export interface Session {
  key: string;
  value: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_prefix: string;
  key_hash: string;
  is_active: boolean;
  expires_at: Date;
  last_used_at: Date;
}

export interface AuthDatabase {
  users: User;
  sessions: Session;
  api_keys: ApiKey;
}
