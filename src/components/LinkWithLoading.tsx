"use client";

import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

type LinkWithLoadingProps = ComponentPropsWithoutRef<typeof Link>;

export default function LinkWithLoading({ 
  href, 
  children, 
  className, 
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

