"use client";

import { OrderResponseDTO } from "@/dtos/orderDTO";
import { updateOrderStatus, assignDeliverer } from "@/actions/order.actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Truck, Package, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AssignDelivererDialog } from "./AssignDelivererDialog";
import { OrderStatusDialog } from "./OrderStatusDialog";

interface OrderActionsProps {
    order: OrderResponseDTO;
    tenantId: string;
}

export function OrderActions({ order, tenantId }: OrderActionsProps) {
    const router = useRouter();
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setIsLoading(true);
        try {
            await updateOrderStatus(order.id, { 
                status: newStatus as "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_DELIVERY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" 
            });
            toast.success("Status do pedido atualizado com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar status do pedido");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignDeliverer = async (delivererId: string | null) => {
        setIsLoading(true);
        try {
            if (delivererId) {
                await assignDeliverer(order.id, { delivererId });
                toast.success("Entregador atribuído com sucesso!");
            } else {
                await updateOrderStatus(order.id, {});
                toast.success("Entregador removido com sucesso!");
            }
            setIsAssignDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar entregador");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setIsLoading(true);
        try {
            await updateOrderStatus(order.id, { 
                status: newStatus as "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_DELIVERY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" 
            });
            toast.success("Status do pedido atualizado com sucesso!");
            setIsStatusDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar status do pedido");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Sempre permitir alterar entregador, independente do status
    const canAssignDeliverer = true;
    const canChangeStatus = true;

    const getNextStatus = () => {
        const statusFlow: Record<string, string> = {
            PENDING: "CONFIRMED",
            CONFIRMED: "PREPARING",
            PREPARING: "READY_FOR_DELIVERY",
            READY_FOR_DELIVERY: "OUT_FOR_DELIVERY",
            OUT_FOR_DELIVERY: "DELIVERED",
        };
        return statusFlow[order.status];
    };

    const getNextStatusLabel = () => {
        const labelMap: Record<string, string> = {
            CONFIRMED: "Confirmar",
            PREPARING: "Iniciar Preparo",
            READY_FOR_DELIVERY: "Marcar como Pronto",
            OUT_FOR_DELIVERY: "Marcar como Entregue",
        };
        return labelMap[getNextStatus() || ""] || "Avançar Status";
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canChangeStatus && (
                        <>
                            <DropdownMenuItem
                                onClick={() => setIsStatusDialogOpen(true)}
                                disabled={isLoading}
                            >
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Alterar Status
                            </DropdownMenuItem>
                            {getNextStatus() && (
                                <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(getNextStatus() || "")}
                                    disabled={isLoading}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    {getNextStatusLabel()}
                                </DropdownMenuItem>
                            )}
                        </>
                    )}
                    {canAssignDeliverer && (
                        <DropdownMenuItem
                            onClick={() => setIsAssignDialogOpen(true)}
                            disabled={isLoading}
                        >
                            <Truck className="h-4 w-4 mr-2" />
                            {order.delivererId ? "Alterar Entregador" : "Atribuir Entregador"}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AssignDelivererDialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                orderId={order.id}
                currentDelivererId={order.delivererId || undefined}
                onAssign={handleAssignDeliverer}
            />

            <OrderStatusDialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
                currentStatus={order.status}
                onStatusChange={handleStatusChange}
            />
        </>
    );
}

