"use client";

import { OrderResponseDTO } from "@/dtos/orderDTO";
import { updateOrderStatus } from "@/actions/order.actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface OrderQuickActionsProps {
    order: OrderResponseDTO;
}

export function OrderQuickActions({ order }: OrderQuickActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            await updateOrderStatus(order.id, { status: "CONFIRMED" });
            toast.success("Pedido aceito com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao aceitar pedido");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await updateOrderStatus(order.id, { status: "CANCELLED" });
            toast.success("Pedido rejeitado com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao rejeitar pedido");
        } finally {
            setIsLoading(false);
        }
    };

    if (order.status !== "PENDING") {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                onClick={handleAccept}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
            >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aceitar
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading}
            >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeitar
            </Button>
        </div>
    );
}

