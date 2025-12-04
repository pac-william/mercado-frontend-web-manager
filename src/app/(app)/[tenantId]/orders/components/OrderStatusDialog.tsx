"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OrderStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: string;
    onStatusChange: (newStatus: string) => Promise<void>;
}

const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PREPARING", label: "Preparando" },
    { value: "READY_FOR_DELIVERY", label: "Pronto para Entrega" },
    { value: "OUT_FOR_DELIVERY", label: "Saiu para Entrega" },
    { value: "DELIVERED", label: "Entregue" },
    { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusDialog({
    open,
    onOpenChange,
    currentStatus,
    onStatusChange,
}: OrderStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async () => {
        if (!selectedStatus || selectedStatus === currentStatus) return;
        
        setIsLoading(true);
        try {
            await onStatusChange(selectedStatus);
            onOpenChange(false);
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        return statusOptions.find(opt => opt.value === status)?.label || status;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar Status do Pedido</DialogTitle>
                    <DialogDescription>
                        Selecione o novo status para este pedido.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status Atual</Label>
                        <div className="p-2 bg-muted rounded-md">
                            <p className="text-sm font-medium">{getStatusLabel(currentStatus)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newStatus">Novo Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="newStatus">
                                <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleStatusChange}
                        disabled={isLoading || !selectedStatus || selectedStatus === currentStatus}
                    >
                        {isLoading ? "Alterando..." : "Alterar Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

