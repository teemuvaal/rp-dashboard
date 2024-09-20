'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { login, signup } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.target);
    const result = await (isSignup ? signup(formData) : login(formData));

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      // Redirect to dashboard or home page
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <motion.div
        className="hidden md:block md:w-1/2 h-full relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src="/login.png"
          alt="Login"
          className="absolute h-full w-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear" }}
        />
      </motion.div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-white to-gray-200">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isSignup ? "Sign Up" : "Login"}</CardTitle>
            <CardDescription>{isSignup ? "Create a new account" : "Login to your account"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">{isSignup ? "Sign Up" : "Login"}</Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-sm w-full">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Button variant="link" onClick={() => setIsSignup(!isSignup)} className="p-0">
                {isSignup ? "Login" : "Sign Up"}
              </Button>
            </p>
            <p className="text-sm w-full">
              <Link href="/login/reset/">
                <Button
                variant="link"
                >
                  Reset Password
                </Button>
              </Link>
            </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}