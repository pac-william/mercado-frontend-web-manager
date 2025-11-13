"use client";

import LoadingSpinner from "./LoadingSpinner";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  zIndex?: number;
}

export default function LoadingOverlay({ 
  isLoading, 
  message = "Carregando...",
  zIndex = 50 
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex }}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-white">
          {message}
        </p>
      </div>
    </div>
  );
}

