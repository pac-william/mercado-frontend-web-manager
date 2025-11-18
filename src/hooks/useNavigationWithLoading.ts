"use client";

import { useRouter } from "next/navigation";

export function useNavigationWithLoading() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return { navigate, router };
}

