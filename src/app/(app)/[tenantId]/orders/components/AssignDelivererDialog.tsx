"use client";

import { useEffect, useState } from "react";
import { getDeliverers } from "@/actions/deliverer.actions";
import { Deliverer } from "@/app/domain/delivererDomain";
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

interface AssignDelivererDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    currentDelivererId?: string;
    onAssign: (delivererId: string) => Promise<void>;
}

export function AssignDelivererDialog({
    open,
    onOpenChange,
    orderId,
    currentDelivererId,
    onAssign,
}: AssignDelivererDialogProps) {
    const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
    const [selectedDelivererId, setSelectedDelivererId] = useState<string>(currentDelivererId || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDeliverers, setIsLoadingDeliverers] = useState(false);

    useEffect(() => {
        if (open) {
            loadDeliverers();
            setSelectedDelivererId(currentDelivererId || "");
        }
    }, [open, currentDelivererId]);

    const loadDeliverers = async () => {
        setIsLoadingDeliverers(true);
        try {
            const response = await getDeliverers({ status: "ACTIVE", size: 100 });
            setDeliverers(response.deliverers || []);
        } catch (error) {
            console.error("Erro ao carregar entregadores:", error);
        } finally {
            setIsLoadingDeliverers(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedDelivererId) return;
        setIsLoading(true);
        try {
            await onAssign(selectedDelivererId);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Atribuir Entregador</DialogTitle>
                    <DialogDescription>
                        Selecione um entregador para realizar a entrega deste pedido.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="deliverer">Entregador</Label>
                        <Select
                            value={selectedDelivererId}
                            onValueChange={setSelectedDelivererId}
                            disabled={isLoading || isLoadingDeliverers}
                        >
                            <SelectTrigger id="deliverer">
                                <SelectValue placeholder="Selecione um entregador" />
                            </SelectTrigger>
                            <SelectContent>
                                {deliverers.map((deliverer) => (
                                    <SelectItem key={deliverer.id} value={deliverer.id}>
                                        {deliverer.name} - {deliverer.vehicle.type}
                                        {deliverer.vehicle.plate && ` (${deliverer.vehicle.plate})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isLoadingDeliverers && (
                            <p className="text-sm text-muted-foreground">Carregando entregadores...</p>
                        )}
                        {!isLoadingDeliverers && deliverers.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhum entregador disponível</p>
                        )}
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
                        onClick={handleAssign}
                        disabled={isLoading || !selectedDelivererId || isLoadingDeliverers}
                    >
                        {isLoading ? "Atribuindo..." : "Atribuir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

