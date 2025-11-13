"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ManageMarketButtonProps {
  marketId: string;
}

export default function ManageMarketButton({ marketId }: ManageMarketButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    router.push(`/${marketId}/dashboard`);
  };

  // Limpa o loading quando o componente desmontar (navegação concluída)
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return (
    <>
      <Button 
        variant="link" 
        className="px-0" 
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Carregando...
          </span>
        ) : (
          "Gerenciar"
        )}
      </Button>
      
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Carregando dashboard...
            </p>
          </div>
        </div>
      )}
    </>
  );
}

