'use client'
import { useState } from "react";
import Link from "next/link";
import {zodResolver} from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {CreateUserSchema } from "@/schemas/types"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import axios from 'axios'
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/app/config/url";


const SignUp = () => {
  const router=  useRouter();
  const [showPassword, setShowPassword] = useState(false);
const  [button_loading , setButton_Loading] = useState(false) ;
    const {register , handleSubmit , formState : {errors}}  = useForm<z.infer<typeof CreateUserSchema>>(
        {
            resolver:zodResolver(CreateUserSchema)
        }
    )

const onSubmit = async (data: z.infer<typeof CreateUserSchema>) => {
  console.log(data)
  try {
    setButton_Loading(true);

    const response = await axios.post(
      `${BACKEND_URL}/sign-up`,
      {
        name: data.name,
        email: data.email,
        password: data.password,
      }
    );

    console.log("Signup success:", response.data);

    // optional: redirect or toast here
  } catch (error: any) {
    console.error(
      "Signup failed:",
      error?.response?.data || error.message
    );
  } finally {
    setButton_Loading(false);
    router.push('/sign-in')
    
  }
};


  return (
    <div className="flex min-h-screen gradient-hero">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center gradient-primary p-12">
        <div className="text-center text-primary-foreground">
          <h2 className="mb-4 text-4xl font-bold">Join our community</h2>
          <p className="text-lg opacity-90">
            Create an account and unlock all the features we have to offer.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
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
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Enter your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                
                required
                className="h-12"
              />

               {errors.name && (
          <p>{errors.name.message}</p>
        )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                
                required
                className="h-12"
              />
               {errors.email && (
          <p>{errors.email.message}</p>
        )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('password')}
               
                  required
                  className="h-12 pr-12"
                />
                 {errors.password && (
          <p>{errors.password.message}</p>
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
     <div className="flex p-3"></div>
            <Button disabled={button_loading} type="submit" className="h-12 w-full shadow-soft">
              Create Account
            </Button>
            {
                button_loading &&  <Loader2/> 
            }
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
