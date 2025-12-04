"use client";

import { useEffect, useState } from "react";
import { getDeliverers, getDelivererById } from "@/actions/deliverer.actions";
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
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface AssignDelivererDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    currentDelivererId?: string;
    onAssign: (delivererId: string | null) => Promise<void>;
}

export function AssignDelivererDialog({
    open,
    onOpenChange,
    orderId,
    currentDelivererId,
    onAssign,
}: AssignDelivererDialogProps) {
    const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
    const [currentDeliverer, setCurrentDeliverer] = useState<Deliverer | null>(null);
    const [selectedDelivererId, setSelectedDelivererId] = useState<string>(currentDelivererId || "__none__");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDeliverers, setIsLoadingDeliverers] = useState(false);
    const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);

    useEffect(() => {
        if (open) {
            loadDeliverers();
            if (currentDelivererId) {
                loadCurrentDeliverer();
            } else {
                setCurrentDeliverer(null);
            }
            setSelectedDelivererId(currentDelivererId || "__none__");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const loadCurrentDeliverer = async () => {
        if (!currentDelivererId) {
            setCurrentDeliverer(null);
            return;
        }
        
        setIsLoadingCurrent(true);
        try {
            const deliverer = await getDelivererById(currentDelivererId);
            setCurrentDeliverer(deliverer);
        } catch (error) {
            console.error("Erro ao carregar entregador atual:", error);
            setCurrentDeliverer(null);
        } finally {
            setIsLoadingCurrent(false);
        }
    };

    const handleAssign = async () => {
        setIsLoading(true);
        try {
            const delivererIdToAssign = selectedDelivererId === "__none__" ? null : selectedDelivererId;
            await onAssign(delivererIdToAssign);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {currentDelivererId ? "Alterar Entregador" : "Atribuir Entregador"}
                    </DialogTitle>
                    <DialogDescription>
                        {currentDelivererId 
                            ? "Altere ou remova o entregador atribuído a este pedido."
                            : "Selecione um entregador para realizar a entrega deste pedido."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Entregador Atual */}
                    {currentDelivererId && (
                        <>
                            <div className="space-y-2">
                                <Label>Entregador Atual</Label>
                                {isLoadingCurrent ? (
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Carregando...</p>
                                    </div>
                                ) : currentDeliverer ? (
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="font-medium text-sm">{currentDeliverer.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {currentDeliverer.vehicle.type}
                                            {currentDeliverer.vehicle.plate && ` • ${currentDeliverer.vehicle.plate}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{currentDeliverer.phone}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm text-muted-foreground">
                                            ID: {currentDelivererId.slice(0, 8)}...
                                        </p>
                                    </div>
                                )}
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Seleção de Entregador */}
                    <div className="space-y-2">
                        <Label htmlFor="deliverer">
                            {currentDelivererId ? "Novo Entregador" : "Entregador"}
                        </Label>
                        <Select
                            value={selectedDelivererId}
                            onValueChange={setSelectedDelivererId}
                            disabled={isLoading || isLoadingDeliverers}
                        >
                            <SelectTrigger id="deliverer">
                                <SelectValue placeholder="Selecione um entregador" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">
                                    <span className="text-muted-foreground">Nenhum (Remover)</span>
                                </SelectItem>
                                {deliverers.map((deliverer) => (
                                    <SelectItem key={deliverer.id} value={deliverer.id}>
                                        {deliverer.name} - {deliverer.vehicle.type}
                                        {deliverer.vehicle.plate && ` (${deliverer.vehicle.plate})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isLoadingDeliverers && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando entregadores...
                            </p>
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
                        disabled={isLoading || isLoadingDeliverers || isLoadingCurrent}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {selectedDelivererId === "__none__" ? "Removendo..." : "Atribuindo..."}
                            </>
                        ) : (
                            selectedDelivererId === "__none__" ? "Remover Entregador" : 
                            currentDelivererId ? "Alterar Entregador" : "Atribuir Entregador"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

