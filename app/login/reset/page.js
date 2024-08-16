'use client';

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { updatePassword } from './actions';
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
  const [password, setPassword] = useState('');

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
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent className="">
            <form action={updatePassword} className="flex flex-col gap-2">
              <Input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Separator />
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}