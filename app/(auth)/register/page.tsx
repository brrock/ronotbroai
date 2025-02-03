'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { register } from '../actions';

export default function Page() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    try {
      const result = await register({ status: 'idle' }, formData);

      if (result.status === 'user_exists') {
        toast.error('Account already exists');
        return;
      }

      if (result.status === 'failed') {
        toast.error('Failed to create account');
        return;
      }

      if (result.status === 'invalid_data') {
        toast.error('Please fill in all fields');
        return;
      }

      // If registration was successful, sign in
      const signInResult = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('Failed to sign in after registration');
        return;
      }

      toast.success('Account created successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register');
    }
  }

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Create Account</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <AuthForm action={handleSubmit}>
          <SubmitButton>Sign Up</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Already have an account? '}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            {' instead.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
