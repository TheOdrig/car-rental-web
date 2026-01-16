import { jwtVerify, type JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload {
  sub: string;
  userId: number;
  roles: string[];
  exp: number;
  iat: number;
}

export interface VerifyResult {
  valid: boolean;
  payload: TokenPayload | null;
  error?: string;
}

function getSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[JWT Verifier] JWT_SECRET environment variable is not configured');
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function verifyToken(token: string): Promise<VerifyResult> {
  const secret = getSecretKey();
  
  if (!secret) {
    return {
      valid: false,
      payload: null,
      error: 'Configuration error: JWT_SECRET not set',
    };
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.userId !== 'number' ||
      !Array.isArray(payload.roles) ||
      typeof payload.exp !== 'number'
    ) {
      return {
        valid: false,
        payload: null,
        error: 'Invalid token payload structure',
      };
    }

    return {
      valid: true,
      payload: payload as TokenPayload,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('signature')) {
      return {
        valid: false,
        payload: null,
        error: 'Invalid signature',
      };
    }
    
    if (errorMessage.includes('expired')) {
      return {
        valid: false,
        payload: null,
        error: 'Token expired',
      };
    }
    
    if (errorMessage.includes('malformed')) {
      return {
        valid: false,
        payload: null,
        error: 'Malformed token',
      };
    }

    return {
      valid: false,
      payload: null,
      error: errorMessage,
    };
  }
}

export function isTokenExpired(payload: TokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
