export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  created_at: string;
}
export interface Credentials { email: string; password: string }
export interface Registration extends Credentials { name: string; country: string }
export interface TokenResponse { access_token: string; token_type: string; expires_in: number }
