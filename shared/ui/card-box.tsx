"use client";

import { Card } from "flowbite-react";
import React from "react";

interface CardBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBox: React.FC<CardBoxProps> = ({ children, className }) => {
  return (
    <Card
      className={`card p-6 shadow-none border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </Card>
  );
};
