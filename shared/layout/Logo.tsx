"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className = "" }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}
    >
      {/* Icon Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
        <Icon icon="tabler:math-symbols" className="text-white" height={24} />
      </div>

      {/* Text Logo */}
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-xl font-bold leading-tight text-gray-900 dark:text-white">
            Daily<span className="text-primary-600">Math</span>
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
            Practice Daily
          </span>
        </div>
      )}
    </Link>
  );
}

export default Logo;
