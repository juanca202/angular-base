export interface RefreshableAuthProvider {
  refreshToken(): Promise<string>;
}
