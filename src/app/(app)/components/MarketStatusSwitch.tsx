"use client"

import { updateMarketStatus } from "@/actions/market.actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

interface MarketStatusSwitchProps {
    marketId: string;
    marketName: string;
    initialStatus: boolean;
    onStatusChange?: (isOpen: boolean) => void;
}

export function MarketStatusSwitch({
    marketId,
    marketName,
    initialStatus,
    onStatusChange,
}: MarketStatusSwitchProps) {
    const [isOpen, setIsOpen] = useState(initialStatus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);

    const handleSwitchChange = (checked: boolean) => {
        setPendingStatus(checked);
        setIsDialogOpen(true);
    };

    const handleConfirm = async () => {
        if (!password.trim()) {
            toast.error("Por favor, insira a senha de gerente");
            return;
        }

        if (pendingStatus === null) {
            setIsDialogOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            await updateMarketStatus(marketId, pendingStatus, password);
            setIsOpen(pendingStatus);
            setIsDialogOpen(false);
            setPassword("");
            setPendingStatus(null);
            toast.success(
                `Mercado ${pendingStatus ? "aberto" : "fechado"} com sucesso!`
            );
            onStatusChange?.(pendingStatus);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar status do mercado"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setPassword("");
        setPendingStatus(null);
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Switch
                    checked={isOpen}
                    onCheckedChange={handleSwitchChange}
                    disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">
                    {isOpen ? "Aberto" : "Fechado"}
                </span>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingStatus
                                ? "Abrir mercado"
                                : "Fechar mercado"}
                        </DialogTitle>
                        <DialogDescription>
                            Para {pendingStatus ? "abrir" : "fechar"} o mercado{" "}
                            <strong>{marketName}</strong>, insira a senha de
                            gerente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha de gerente</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite a senha de gerente"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleConfirm();
                                    }
                                }}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirm} disabled={isLoading}>
                            {isLoading ? "Confirmando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

