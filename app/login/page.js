'use client';

import React, { useState } from 'react';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="flex h-screen w-full">
      <motion.img
        src="/login.png"
        alt="Login"
        className="h-full object-cover"
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 30, ease: "linear" }}
      />
      <div className="flex md:justify-end h-full w-full md:absolute md:right-0 md:w-1/2 items-center bg-black bg-opacity-20">
        <Card className="w-[400px] items-center mr-10 bg-opacity-50 h-80 border-gray-300 border-2 shadow-md">
          <CardHeader>
            <CardTitle>{isSignup ? "Sign Up" : "Login"}</CardTitle>
            <CardDescription>{isSignup ? "Create a new account" : "Login to your account"}</CardDescription>
          </CardHeader>
          <CardContent className="">
            <form action={isSignup ? signup : login} className="flex flex-col gap-2">
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
              <Separator />
              <Button type="submit">{isSignup ? "Sign Up" : "Login"}</Button>
            </form>
          </CardContent>
          <CardFooter>
            <p>{isSignup ? "Already have an account? " : "Don't have an account? "} <strong><Button variant="link" onClick={() => setIsSignup(!isSignup)}>{isSignup ? "Login" : "Sign Up"}</Button></strong></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}