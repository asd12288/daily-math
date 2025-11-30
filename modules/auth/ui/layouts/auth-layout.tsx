"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { Icon } from "@iconify/react";
import { AuthSidebar } from "../components/auth-sidebar";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <>
      {/* Mobile header with logo */}
      <div className="p-5 lg:bg-transparent lg:dark:bg-transparent bg-primary-50 dark:bg-gray-800 lg:fixed top-0 z-50 w-full lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
            <Icon icon="tabler:math-symbols" className="text-white" height={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight text-gray-900 dark:text-white">
              Daily<span className="text-primary-600">Math</span>
            </span>
          </div>
        </Link>
      </div>

      <div className="relative overflow-hidden min-h-screen lg:h-screen">
        <div className="grid grid-cols-12 gap-0 min-h-screen lg:h-screen bg-white dark:bg-gray-900">
          {/* Left Side - Illustration (hidden on mobile) */}
          <div className="xl:col-span-8 lg:col-span-7 col-span-12 bg-primary-50 dark:bg-gray-800 lg:block hidden relative overflow-hidden">
            <AuthSidebar />
          </div>

          {/* Right Side - Form */}
          <div className="xl:col-span-4 lg:col-span-5 col-span-12 sm:px-12 px-5 py-8 lg:py-0">
            <div className="flex min-h-[calc(100vh-100px)] lg:h-screen items-center px-3 lg:justify-start justify-center">
              <div className="max-w-[420px] w-full mx-auto">
                {/* Desktop Logo */}
                <div className="hidden lg:block mb-8">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                      <Icon icon="tabler:math-symbols" className="text-white" height={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold leading-tight text-gray-900 dark:text-white">
                        Daily<span className="text-primary-600">Math</span>
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Title */}
                <div className="mb-2">
                  {title && (
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
