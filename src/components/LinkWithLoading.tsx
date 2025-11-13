"use client";

import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

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

  const handleClick = () => {
    // loading behavior removed
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

