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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');

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
          alt="Reset Password"
          className="absolute h-full w-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear" }}
        />
      </motion.div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-white to-gray-200">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updatePassword} className="space-y-4">
              <Input 
                type="password" 
                name="password"
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}