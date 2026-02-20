export interface JWTTokenPayload {
    // 🔹 Registered claims (todos opcionales según RFC 7519)
    iss?: string;   // issuer
    sub?: string;   // subject (user id)
    aud?: string;   // audience
    exp?: number;   // expiration (timestamp en segundos)
    nbf?: number;   // not before
    iat?: number;   // issued at
    jti?: string;   // token id
  
    // 🔹 Custom claims (definidos por tu sistema)
    username?: string;
    roles?: string[];
    permissions?: string[];
  
    // permite extender con otros claims personalizados
    [key: string]: unknown;
  }