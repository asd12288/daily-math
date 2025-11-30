"use client";
import Image from "next/image";
import React from "react";
export const AuthSidebar = () => {
  return (
    <div className="flex justify-center h-screen items-center z-10 relative">
      <div className="xl:w-5/12 lg:w-10/12 xl:px-0 px-6">
        <Image
          src="/images/backgrounds/login-security.svg"
          alt="auth-bg"
          className="w-full"
          width={500}
          height={500}
          priority
        />
      </div>
    </div>
  );
};
