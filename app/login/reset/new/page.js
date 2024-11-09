import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DynamicResetPasswordForm = dynamic(() => import('./ResetPasswordForm'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="hidden md:block md:w-1/2 h-full relative overflow-hidden">
        <img
          src="/login.png"
          alt="Reset Password"
          className="absolute h-full w-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-white to-gray-200">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <DynamicResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}