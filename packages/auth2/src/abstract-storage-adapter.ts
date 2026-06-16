import type {ApiKey, User} from './types.ts';

type SelectedUser = Pick<User, 'id' | 'email' | 'hash'>;

/**
 * Implement this class to create a kosmic auth instance based on a DB of your choice
 */
export abstract class AbstractStorageAdapter {
  abstract getUserById(userId: string | number): Promise<SelectedUser>;
  abstract getUserByEmail(email: string): Promise<SelectedUser>;
  abstract getUserByApiKey(apiKey: string): Promise<SelectedUser>;
  abstract getApiKeysByPrefix(keyPrefix: string): Promise<ApiKey[]>;
  abstract verifyUserPassword(
    hash: string,
    password: string,
  ): Promise<SelectedUser>;
  abstract updateApiKeyLastUsedAt(lastUsedAt: Date): Promise<void>;
}
