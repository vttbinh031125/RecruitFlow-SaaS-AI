'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
const schema = z.object({
  fullName: z.string().max(100).optional(),
  email: z.email(),
  password: z.string().min(12).max(72),
});
export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-6 text-2xl font-semibold">
        {register ? 'Create your candidate account' : 'Welcome back'}
      </h1>
      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (data) => {
          setError('');
          try {
            if (register) {
              await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
              });
            }
            await api('/auth/login', {
              method: 'POST',
              body: JSON.stringify({
                email: data.email,
                password: data.password,
              }),
            });
            router.push('/dashboard');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Sign in failed');
          }
        })}
      >
        {register && (
          <div>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              {...field('fullName')}
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </div>
        )}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            type="email"
            autoComplete="email"
            {...field('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            type="password"
            autoComplete={register ? 'new-password' : 'current-password'}
            {...field('password')}
          />
          {errors.password && (
            <p id="password-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <Button disabled={isSubmitting}>
          {isSubmitting
            ? 'Please wait...'
            : register
              ? 'Create account'
              : 'Log in'}
        </Button>
      </form>
      <Link
        className="mt-6 block text-sm text-indigo-600"
        href={register ? '/login' : '/register'}
      >
        {register ? 'Already have an account?' : 'Create a candidate account'}
      </Link>
    </div>
  );
}
