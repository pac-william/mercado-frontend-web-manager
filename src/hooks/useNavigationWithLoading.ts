"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

export function useNavigationWithLoading() {
  const router = useRouter();
  const { setLoading } = useLoading();

  const navigate = (path: string, message?: string) => {
    setLoading(true, message);
    router.push(path);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return { navigate, router };
}

