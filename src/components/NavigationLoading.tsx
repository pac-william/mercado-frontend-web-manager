"use client";

import { useInterceptNavigation } from "@/hooks/useInterceptNavigation";
import { useLoading } from "@/contexts/LoadingContext";
import LoadingOverlay from "./LoadingOverlay";

export default function NavigationLoading() {
  const { isLoading, loadingMessage } = useLoading();
  useInterceptNavigation();
  return <LoadingOverlay isLoading={isLoading} message={loadingMessage} />;
}

