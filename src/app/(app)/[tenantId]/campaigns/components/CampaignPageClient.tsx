"use client";

import { Campaign } from "@/app/domain/campaignDomain";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CampaignList } from "./CampaignList";
import { SlotVisualization } from "./SlotVisualization";
import { CampaignForm } from "./CampaignForm";
import { getCampaignsByMarket, getAllActiveCampaignsForSlots } from "@/actions/campaign.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CampaignPageClientProps {
    tenantId: string;
    initialCampaigns: Campaign[];
}

export default function CampaignPageClient({
    tenantId,
    initialCampaigns,
}: CampaignPageClientProps) {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [allActiveCampaigns, setAllActiveCampaigns] = useState<Campaign[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<number | undefined>();

    const handleRefresh = async () => {
        try {
            // Buscar campanhas do mercado atual
            const updatedCampaigns = await getCampaignsByMarket(tenantId);
            setCampaigns(updatedCampaigns);
            
            // Buscar TODAS as campanhas ativas/agendadas para visualização de slots (slots são globais)
            const allActive = await getAllActiveCampaignsForSlots();
            setAllActiveCampaigns(allActive);
            
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar campanhas"
            );
        }
    };

    // Carregar todas as campanhas ativas na inicialização
    useEffect(() => {
        const loadAllActiveCampaigns = async () => {
            try {
                const allActive = await getAllActiveCampaignsForSlots();
                setAllActiveCampaigns(allActive);
            } catch (error) {
                console.error("Erro ao buscar campanhas ativas:", error);
            }
        };
        loadAllActiveCampaigns();
    }, []);

    const handleCreate = () => {
        setEditingCampaign(undefined);
        setSelectedSlot(undefined);
        setFormOpen(true);
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setSelectedSlot(campaign.slot);
        setFormOpen(true);
    };

    const handleSlotClick = (slot: number) => {
        // Verificar se há campanha neste slot do mercado atual (para edição)
        const ownCampaign = campaigns.find(
            (c) => c.slot === slot && (c.status === "ACTIVE" || c.status === "SCHEDULED" || c.status === "DRAFT")
        );
        
        // Se existe campanha deste mercado no slot, permitir editar
        if (ownCampaign) {
            setEditingCampaign(ownCampaign);
            setSelectedSlot(slot);
        } else {
            // Verificar se há campanha de OUTRO mercado neste slot
            const otherMarketCampaign = allActiveCampaigns.find(
                (c) => c.slot === slot && 
                       (c.status === "ACTIVE" || c.status === "SCHEDULED" || c.status === "DRAFT") &&
                       c.marketId !== tenantId
            );
            
            if (otherMarketCampaign) {
                // Slot ocupado por outro mercado - avisar mas permitir agendar para outro período
                toast.warning(`Slot ${slot} está ocupado por outro mercado. Escolha um período diferente.`);
            }
            
            setEditingCampaign(undefined);
            setSelectedSlot(slot);
        }
        setFormOpen(true);
    };

    const handleFormSuccess = () => {
        handleRefresh();
    };

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-row items-center justify-between">
                <HeaderInfo
                    title="Campanhas Promocionais"
                    description="Gerencie as campanhas promocionais exibidas no carrossel da Home"
                />
                <Button onClick={handleCreate}>
                    <Plus size={16} />
                    Nova Campanha
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <SlotVisualization
                        campaigns={allActiveCampaigns}
                        selectedSlot={selectedSlot}
                        onSlotClick={handleSlotClick}
                    />
                </div>

                <div className="space-y-6">
                    <CampaignList
                        campaigns={campaigns}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </div>
            </div>

            <CampaignForm
                open={formOpen}
                onOpenChange={setFormOpen}
                marketId={tenantId}
                campaign={editingCampaign}
                campaigns={allActiveCampaigns}
                onSuccess={handleFormSuccess}
                selectedSlot={selectedSlot}
            />
        </div>
    );
}

