export interface SignupAuthProvider {
  signup(data: any): Promise<void>;
}
