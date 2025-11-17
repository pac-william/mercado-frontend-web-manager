"use client";

import { Campaign, CampaignStatus } from "@/app/domain/campaignDomain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { activateCampaign, deactivateCampaign, deleteCampaign } from "@/actions/campaign.actions";
import { Edit, MoreVertical, Power, PowerOff, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import moment from "moment";

interface CampaignListProps {
    campaigns: Campaign[];
    onEdit: (campaign: Campaign) => void;
    onRefresh: () => void;
}

const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
        case "ACTIVE":
            return <Badge className="bg-green-500">Ativa</Badge>;
        case "SCHEDULED":
            return <Badge className="bg-blue-500">Agendada</Badge>;
        case "DRAFT":
            return <Badge variant="outline">Rascunho</Badge>;
        case "EXPIRED":
            return <Badge className="bg-red-500">Expirada</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

export function CampaignList({ campaigns, onEdit, onRefresh }: CampaignListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">("ALL");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

    const filteredCampaigns = campaigns.filter(
        (campaign) => statusFilter === "ALL" || campaign.status === statusFilter
    );

    const handleActivate = (campaign: Campaign) => {
        startTransition(async () => {
            try {
                await activateCampaign(campaign.id);
                toast.success("Campanha ativada com sucesso");
                onRefresh();
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao ativar campanha"
                );
            }
        });
    };

    const handleDeactivate = (campaign: Campaign) => {
        startTransition(async () => {
            try {
                await deactivateCampaign(campaign.id);
                toast.success("Campanha desativada com sucesso");
                onRefresh();
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao desativar campanha"
                );
            }
        });
    };

    const handleDelete = () => {
        if (!campaignToDelete) return;

        startTransition(async () => {
            try {
                await deleteCampaign(campaignToDelete.id);
                toast.success("Campanha excluída com sucesso");
                setDeleteDialogOpen(false);
                setCampaignToDelete(null);
                onRefresh();
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao excluir campanha"
                );
            }
        });
    };

    if (campaigns.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma campanha cadastrada ainda.</p>
                <p className="text-sm mt-2">
                    Clique em "Nova Campanha" para começar.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setStatusFilter(value as CampaignStatus | "ALL")
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="ACTIVE">Ativas</SelectItem>
                            <SelectItem value="SCHEDULED">Agendadas</SelectItem>
                            <SelectItem value="DRAFT">Rascunhos</SelectItem>
                            <SelectItem value="EXPIRED">Expiradas</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                        {filteredCampaigns.length} de {campaigns.length} campanhas
                    </span>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Slot</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data de Início</TableHead>
                            <TableHead>Data de Fim</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCampaigns.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    Nenhuma campanha encontrada com o filtro selecionado
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCampaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">
                                        {campaign.title}
                                    </TableCell>
                                    <TableCell>Slot {campaign.slot}</TableCell>
                                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                                    <TableCell>
                                        {moment(campaign.startDate).format(
                                            "DD/MM/YYYY HH:mm"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {campaign.endDate
                                            ? moment(campaign.endDate).format(
                                                  "DD/MM/YYYY HH:mm"
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(campaign)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                {campaign.status === "ACTIVE" ? (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDeactivate(campaign)
                                                        }
                                                        disabled={isPending}
                                                    >
                                                        <PowerOff className="mr-2 h-4 w-4" />
                                                        Desativar
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleActivate(campaign)
                                                        }
                                                        disabled={isPending}
                                                    >
                                                        <Power className="mr-2 h-4 w-4" />
                                                        Ativar
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setCampaignToDelete(campaign);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a campanha "
                            {campaignToDelete?.title}"? Esta ação não pode ser
                            desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


