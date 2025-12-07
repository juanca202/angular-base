import { Signup } from './signup';

export interface SignupAuthProvider {
  signup(data: Signup): Promise<void>;
}
