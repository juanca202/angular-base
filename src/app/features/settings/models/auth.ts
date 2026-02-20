export type AuthMode = 'signin' | 'signup';

export interface AuthSignin {
  username: string;
  password: string;
}

export interface AuthSignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
