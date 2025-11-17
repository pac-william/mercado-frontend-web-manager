"use client";

import { Campaign } from "@/app/domain/campaignDomain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import moment from "moment";

interface SlotVisualizationProps {
    campaigns: Campaign[];
    selectedSlot?: number;
    onSlotClick?: (slot: number) => void;
}

const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
        case "ACTIVE":
            return "bg-green-500";
        case "SCHEDULED":
            return "bg-blue-500";
        case "DRAFT":
            return "bg-gray-500";
        case "EXPIRED":
            return "bg-red-500";
        default:
            return "bg-gray-300";
    }
};

const getStatusLabel = (status: Campaign["status"]) => {
    switch (status) {
        case "ACTIVE":
            return "Ativa";
        case "SCHEDULED":
            return "Agendada";
        case "DRAFT":
            return "Rascunho";
        case "EXPIRED":
            return "Expirada";
        default:
            return status;
    }
};

export function SlotVisualization({ campaigns, selectedSlot, onSlotClick }: SlotVisualizationProps) {
    const slots = Array.from({ length: 8 }, (_, i) => i + 1);
    
    const getCampaignForSlot = (slot: number) => {
        return campaigns.find((c) => c.slot === slot);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Visualização de Slots</CardTitle>
                <CardDescription>
                    Visualize quais slots estão ocupados ou disponíveis. Clique em um slot para selecioná-lo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {slots.map((slot) => {
                        const campaign = getCampaignForSlot(slot);
                        const isSelected = selectedSlot === slot;
                        const isOccupied = !!campaign;

                        return (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => onSlotClick?.(slot)}
                                className={cn(
                                    "relative p-4 rounded-lg border-2 transition-all",
                                    "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : isOccupied
                                        ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20"
                                        : "border-green-300 bg-green-50 dark:bg-green-950/20 hover:border-green-400"
                                )}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-2xl font-bold text-foreground">Slot {slot}</div>
                                    
                                    {isOccupied ? (
                                        <>
                                            <div
                                                className={cn(
                                                    "w-3 h-3 rounded-full",
                                                    getStatusColor(campaign.status)
                                                )}
                                                title={getStatusLabel(campaign.status)}
                                            />
                                            <div className="text-xs text-center text-muted-foreground line-clamp-2">
                                                {campaign.title}
                                            </div>
                                            {campaign.startDate && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {moment(campaign.startDate).format("DD/MM")}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            Disponível
                                        </div>
                                    )}
                                </div>
                                
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {campaigns.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Legenda:</div>
                        <div className="flex flex-wrap gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Ativa</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>Agendada</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-500" />
                                <span>Rascunho</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Expirada</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

