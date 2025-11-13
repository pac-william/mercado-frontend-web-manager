"use client";

import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { ReactNode, ComponentPropsWithoutRef } from "react";

interface LinkWithLoadingProps extends ComponentPropsWithoutRef<typeof Link> {
  message?: string;
}

export default function LinkWithLoading({ 
  href, 
  children, 
  className, 
  message,
  ...props 
}: LinkWithLoadingProps) {
  const { setLoading } = useLoading();

  const handleClick = () => {
    setLoading(true, message);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

