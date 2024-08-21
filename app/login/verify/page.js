'use client'

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
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
            <CardTitle>Almost there!</CardTitle>
            <CardDescription>Check your email for verification to enable your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              We've sent a verification email to your inbox. Please click the link in the email to complete your registration.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500">
              Didn't receive an email? Check your spam folder or contact support if the issue persists.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}