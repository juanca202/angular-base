import { Settings } from '@/core/models/settings';

export abstract class AuthProvider {
  public abstract logout(): boolean;
  public abstract changePassword(): void;
  public abstract confirmDeleteUser(): void;
  public abstract getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false>;
}
