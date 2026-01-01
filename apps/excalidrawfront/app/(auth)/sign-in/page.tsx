"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {SigninSchema} from "@/schemas/types"
import { z } from "zod";
import axios from "axios";
import { Sign, sign } from "crypto";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/app/config/url";

/* ---------------- ZOD SCHEMA ---------------- */


type SignInInput = z.infer<typeof SigninSchema>;

/* ---------------- COMPONENT ---------------- */

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const  router=  useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SigninSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    console.log(data);

    try {
      setButtonLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/sign-in`,
        {
          email: data.email,
          password: data.password,
        }  , 
        {
          withCredentials:true
        }
      );
      // setting token  into localstorage 
      

      console.log("Sign-in success:", response.data.token);

      // 👉 save token / redirect later
    } catch (error: any) {
      console.error(
        "Sign-in failed:",
        error?.response?.data || error.message
      );
    } finally {
      setButtonLoading(false);
      router.push('/join_room')
    }
  };

  return (
    <div className="flex min-h-screen gradient-hero">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center gradient-primary p-12">
        <div className="text-center text-primary-foreground">
          <h2 className="mb-4 text-4xl font-bold">Welcome back</h2>
          <p className="text-lg opacity-90">
            Sign in to continue where you left off.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Sign in to your account
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="h-12"
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="h-12 pr-12"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              disabled={buttonLoading}
              type="submit"
              className="h-12 w-full shadow-soft"
            >
              {buttonLoading ? "Signing in..." : "Sign In"}
            </Button>

            {buttonLoading && (
              <div className="flex justify-center">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
