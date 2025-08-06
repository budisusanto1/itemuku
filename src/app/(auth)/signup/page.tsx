'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { apiFetch } from '@/lib/api';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
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
import { RecaptchaPopover } from '@/components/ui/recaptcha-popover';
import { getSignupSchema, SignupSchemaType } from '../../(auth)/forms/signup-schema';

export default function Page() {
  const router = useRouter();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      name: 'Ridwan',
      email: 'ridwan@test.com',
      password: 'Mojang123!!!',
      passwordConfirmation: 'Mojang123!!!',
      accept: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!isValid) return;
    handleVerifiedSubmit('dummy-recaptcha-token');
  };

  const handleVerifiedSubmit = async (token: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setShowRecaptcha(false);

      const values = form.getValues();

      const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-recaptcha-token': token,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const { message } = await response.json();
        setError(message || 'Failed to register. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Suspense>
      {success && (
        <Alert>
          <AlertIcon>
            <Check />
          </AlertIcon>
          <AlertTitle>
            You have successfully signed up! Please check your email to verify your account.
            <br />
            Then{' '}
            <Link href="/signin" className="text-primary hover:text-primary-darker">
              Log in here
            </Link>.
          </AlertTitle>
        </Alert>
      )}

      {!success && (
        <Form {...form}>
          <form onSubmit={handleSubmit} className="block w-full space-y-5">
            <div className="space-y-1.5 pb-3">
              <h1 className="text-2xl font-semibold tracking-tight text-center">
                Sign Up to Metronic
              </h1>
            </div>

            <div className="flex flex-col gap-3.5">
              <Button
                variant="outline"
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full h-11 text-base"
              >
                <Icons.googleColorful className="size-4!" /> Sign up with Google
              </Button>
            </div>

            <div className="relative py-1.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertIcon>
                  <AlertCircle />
                </AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Input type={passwordVisible ? 'text' : 'password'} placeholder="Your password" {...field} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5"
                    >
                      {passwordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <Input type={passwordConfirmationVisible ? 'text' : 'password'} placeholder="Confirm your password" {...field} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                      className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5"
                    >
                      {passwordConfirmationVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accept"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2.5">
                      <Checkbox id="accept" checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                      <label htmlFor="accept" className="text-sm text-muted-foreground">
                        I agree to the{' '}
                      </label>
                      <Link href="/privacy-policy" target="_blank" className="text-sm font-semibold hover:text-primary">
                        Privacy Policy
                      </Link>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5">
              <RecaptchaPopover
                open={showRecaptcha}
                onOpenChange={(open) => !open && setShowRecaptcha(false)}
                onVerify={handleVerifiedSubmit}
                trigger={
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isProcessing && <LoaderCircleIcon className="size-4 animate-spin" />}
                    Continue
                  </Button>
                }
              />
            </div>

            <div className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/signin" className="text-sm font-semibold hover:text-primary">
                Sign In
              </Link>
            </div>
          </form>
        </Form>
      )}
    </Suspense>
  );
}
