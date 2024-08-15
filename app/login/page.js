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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // Implement login logic here using the login function from actions
    // For example: await login(username, password);
  };

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
      <div className="flex justify-end h-full w-full md:absolute md:right-0 md:w-1/2 items-center">
        <Card className="w-80 items-center mr-10 bg-opacity-50 h-80 border-gray-300 border-2 shadow-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your account</CardDescription>
          </CardHeader>
          <CardContent className="">
            <form onSubmit={handleLogin} className="flex flex-col gap-2">
              <Input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Separator />
              <Button type="submit">Login</Button>
            </form>
          </CardContent>
          <CardFooter>
            <p>Don't have an account? <strong>Sign up</strong></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}