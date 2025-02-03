'use server';

import { createUser, getUser } from '@/lib/db/queries';
import { DatabaseError } from '@/lib/db/error';
import { compare } from 'bcrypt-ts';
import { redirect } from 'next/navigation';
import { auth } from './auth';

export type RegisterActionState = {
  status: 'idle' | 'success' | 'user_exists' | 'failed' | 'invalid_data';
};

export type LoginActionState = {
  status: 'idle' | 'success' | 'failed' | 'invalid_data';
};

export async function register(prevState: RegisterActionState, formData: FormData): Promise<RegisterActionState> {
  if (!(formData instanceof FormData)) {
    console.error('[Auth] Invalid form data received:', formData);
    return { status: 'invalid_data' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log('[Auth] Registration attempt with:', { 
    hasEmail: !!email, 
    hasPassword: !!password,
    emailType: typeof email,
    passwordType: typeof password
  });

  if (!email || !password) {
    console.error('[Auth] Missing fields:', { hasEmail: !!email, hasPassword: !!password });
    return { status: 'invalid_data' };
  }

  try {
    // Create the user
    const user = await createUser(email, password);
    console.log('[Auth] User registered:', user.id);
    return { status: 'success' };
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    
    if (error instanceof DatabaseError && error.cause instanceof Error) {
      if (error.cause.message.includes('unique constraint')) {
        return { status: 'user_exists' };
      }
    }
    
    return { status: 'failed' };
  }
}

export async function login(prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  if (!(formData instanceof FormData)) {
    console.error('[Auth] Invalid form data received:', formData);
    return { status: 'invalid_data' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = formData.get('callbackUrl') as string || '/';

  console.log('[Auth] Login attempt with:', { 
    hasEmail: !!email, 
    hasPassword: !!password,
    emailType: typeof email,
    passwordType: typeof password
  });

  if (!email || !password) {
    console.error('[Auth] Missing fields:', { hasEmail: !!email, hasPassword: !!password });
    return { status: 'invalid_data' };
  }

  try {
    const [user] = await getUser(email);
    if (!user || !user.password) {
      console.log('[Auth] User not found or no password');
      return { status: 'failed' };
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      console.log('[Auth] Invalid password');
      return { status: 'failed' };
    }

    console.log('[Auth] Login successful, redirecting to:', callbackUrl);
    
    // Create the session
    const session = await auth();
    if (session) {
      redirect(callbackUrl);
    }

    return { status: 'success' };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return { status: 'failed' };
  }
} 