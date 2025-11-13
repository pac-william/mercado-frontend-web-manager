"use client";

import { deleteDeliverer, partialUpdateDeliverer } from "@/actions/deliverer.actions";
import { Deliverer } from "@/app/domain/delivererDomain";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DelivererCardAdminProps {
    deliverer: Deliverer;
    tenantId: string;
}

export default function DelivererCardAdmin({ deliverer, tenantId }: DelivererCardAdminProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isActive, setIsActive] = useState(deliverer.status === "ACTIVE");
    const [isToggling, setIsToggling] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteDeliverer(deliverer.id);
            toast.success("Entregador excluído com sucesso");
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao excluir entregador";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (checked: boolean) => {
        setIsToggling(true);
        try {
            await partialUpdateDeliverer(deliverer.id, { status: checked ? "ACTIVE" : "INACTIVE" });
            setIsActive(checked);
            toast.success(checked ? "Entregador ativado com sucesso" : "Entregador desativado com sucesso");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar status do entregador";
            toast.error(errorMessage);
            setIsActive(!checked);
        } finally {
            setIsToggling(false);
        }
    };

    const getVehicleTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            bicicleta: "Bicicleta",
            moto: "Moto",
            carro: "Carro",
        };
        return labels[type] || type;
    };

    return (
        <Card className="flex flex-col w-full max-w-xs">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-1">{deliverer.name}</CardTitle>
                    <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="space-y-2">
                    <div className="flex flex-row items-center justify-between text-sm">
                        <span className="text-muted-foreground">Documento:</span>
                        <span className="font-medium">{deliverer.document}</span>
                    </div>
                    <div className="flex flex-row items-center justify-between text-sm">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="font-medium">{deliverer.phone}</span>
                    </div>
                    <div className="flex flex-row items-center justify-between text-sm">
                        <span className="text-muted-foreground">Veículo:</span>
                        <Badge variant="outline">{getVehicleTypeLabel(deliverer.vehicle.type)}</Badge>
                    </div>
                    {deliverer.vehicle.plate && (
                        <div className="flex flex-row items-center justify-between text-sm">
                            <span className="text-muted-foreground">Placa:</span>
                            <span className="font-medium">{deliverer.vehicle.plate}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-row items-center justify-end gap-1 pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                    >
                        <Link href={`/${tenantId}/deliverers/create?delivererId=${deliverer.id}`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Excluir entregador</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir o entregador &quot;{deliverer.name}&quot;? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? "Excluindo..." : "Excluir"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="flex flex-row items-center justify-between pt-2 border-t">
                    <Label htmlFor={`active-${deliverer.id}`} className="text-sm">
                        {isActive ? "Ativo" : "Inativo"}
                    </Label>
                    <Switch
                        id={`active-${deliverer.id}`}
                        checked={isActive}
                        onCheckedChange={handleToggleActive}
                        disabled={isToggling}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

