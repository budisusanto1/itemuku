'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiErrorWarningFill } from '@remixicon/react';
import { Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { getSigninSchema, SigninSchemaType } from '../../(auth)/forms/signin-schema';

export default function Page() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: 'ridwan@test.com',
      password: 'Mojang123!!!',
      rememberMe: false,
    },
  });

  async function onSubmit(values: SigninSchemaType) {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (response?.error) {
        try {
          const errorData = JSON.parse(response.error);
          setError(errorData.message || 'Invalid credentials');
        } catch {
          setError(response.error || 'Email atau password salah');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="block w-full space-y-5">
        {/* Title */}
        <div className="space-y-1.5 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Sign in to Metronic
          </h1>
        </div>

        {/* Demo Info */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700">
          <RiErrorWarningFill className="text-primary h-4 w-4" />
          <p>
            Use <span className="font-mono font-semibold">demo@kt.com</span> and{' '}
            <span className="font-mono font-semibold">demo123</span> for demo access.
          </p>
        </div>

        {/* Google Sign In */}
        <div className="flex flex-col gap-3.5">
          <Button
            variant="outline"
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            <Icons.googleColorful className="size-5 opacity-100" /> Sign in with Google
          </Button>
        </div>

        {/* Divider */}
        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* ✅ Error Message Box */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-md px-3 py-2 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/reset-password"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  type={passwordVisible ? 'text' : 'password'}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 me-1.5"
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <>
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground"
                >
                  Remember me
                </label>
              </>
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2.5">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing && <LoaderCircleIcon className="size-4 animate-spin" />}
            Continue
          </Button>
        </div>

        {/* Sign Up Link */}
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-sm font-semibold text-foreground hover:text-primary">
            Sign Up
          </Link>
        </p>
      </form>
    </Form>
  );
}
