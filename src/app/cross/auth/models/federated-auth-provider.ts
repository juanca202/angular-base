export interface FederatedAuthProvider {
  connect(provider: string): Promise<boolean>;
}
