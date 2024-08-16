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
            <CardTitle>Almost there!</CardTitle>
            <CardDescription>Check your email for verification to enable your account.</CardDescription>
          </CardHeader>
          <CardContent className="">
          </CardContent>
          <CardFooter>
            <p>Didn't receive an email? Well, I don't know what to tell you. Check your spam folder I guess.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}