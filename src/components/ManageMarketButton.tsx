"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";

interface ManageMarketButtonProps {
  marketId: string;
}

export default function ManageMarketButton({ marketId }: ManageMarketButtonProps) {
  const { navigate } = useNavigationWithLoading();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(`/${marketId}/dashboard`, "Carregando dashboard...");
  };

  return (
    <Button 
      variant="link" 
      className="px-0" 
      onClick={handleClick}
    >
      Gerenciar
    </Button>
  );
}

