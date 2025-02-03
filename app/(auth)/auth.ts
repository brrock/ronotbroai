import { compare } from 'bcrypt-ts';
import NextAuth from 'next-auth';
import type { DefaultSession, AuthOptions  } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession['user'];
  }
}

export const config: AuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        try {
          const [user] = await getUser(credentials.email);
          if (!user || !user.password) {
            console.log('[Auth] User not found or no password');
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            console.log('[Auth] Invalid password');
            return null;
          }

          console.log('[Auth] User authenticated:', user.id);
          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error('[Auth] Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account, profile }) {
      if (trigger === 'update' && session?.user) {
        token.email = session.user.email;
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
