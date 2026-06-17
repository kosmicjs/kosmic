import type {ApiKey, User} from './types.ts';

type SelectedUser = Pick<User, 'id' | 'email' | 'hash'>;

/**
 * Implement this class to create a kosmic auth instance based on a DB of your choice
 */
export abstract class AbstractDataStorage {
  abstract getUserById(userId: string | number): Promise<SelectedUser>;
  abstract getUserByEmail(email: string): Promise<SelectedUser>;
  abstract getApiKeysByPrefix(
    keyPrefix: string,
  ): Promise<Array<Pick<ApiKey, 'user_id' | 'key_hash' | 'expires_at'>>>;
  abstract verifyUserPassword(hash: string, password: string): Promise<boolean>;
  abstract updateApiKeyLastUsedAt(lastUsedAt: Date): Promise<void>;
}
