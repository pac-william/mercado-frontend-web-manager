"use client";

import { Campaign } from "@/app/domain/campaignDomain";
import { CampaignDTO, CampaignUpdateDTO } from "@/dtos/campaignDTO";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SingleImageUploader from "@/components/single-image-uploader";
import { createCampaign, updateCampaign } from "@/actions/campaign.actions";
import { uploadFile } from "@/actions/upload.actions";
import { Loader2 } from "lucide-react";
import moment from "moment";

interface CampaignFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    marketId: string;
    campaign?: Campaign;
    campaigns: Campaign[];
    onSuccess?: () => void;
    selectedSlot?: number;
}

export function CampaignForm({
    open,
    onOpenChange,
    marketId,
    campaign,
    campaigns,
    onSuccess,
    selectedSlot: initialSelectedSlot,
}: CampaignFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | null>(
        campaign?.imageUrl || null
    );
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);

    type FormValues = {
        marketId: string;
        title: string;
        imageUrl: string;
        slot: number | undefined;
        startDate: string;
        endDate: string | undefined;
        status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED";
    };

    const form = useForm<FormValues>({
        defaultValues: {
            marketId,
            title: campaign?.title || "",
            imageUrl: campaign?.imageUrl || "",
            slot: campaign?.slot || undefined,
            startDate: campaign?.startDate
                ? moment(campaign.startDate).format("YYYY-MM-DDTHH:mm")
                : moment().format("YYYY-MM-DDTHH:mm"),
            endDate: campaign?.endDate
                ? moment(campaign.endDate).format("YYYY-MM-DDTHH:mm")
                : undefined,
            status: campaign?.status || "DRAFT",
        },
    });

    useEffect(() => {
        if (campaign) {
            form.reset({
                marketId,
                title: campaign.title,
                imageUrl: campaign.imageUrl,
                slot: campaign.slot,
                startDate: moment(campaign.startDate).format("YYYY-MM-DDTHH:mm"),
                endDate: campaign.endDate
                    ? moment(campaign.endDate).format("YYYY-MM-DDTHH:mm")
                    : undefined,
                status: campaign.status,
            });
            setImagePreview(campaign.imageUrl);
            setUploadedImageFile(null); // Limpar arquivo quando carregar campanha existente
        } else {
            form.reset({
                marketId,
                title: "",
                imageUrl: "",
                slot: initialSelectedSlot || undefined,
                startDate: moment().format("YYYY-MM-DDTHH:mm"),
                endDate: undefined,
                status: "DRAFT",
            });
            setImagePreview(null);
            setUploadedImageFile(null); // Limpar arquivo quando criar nova campanha
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaign?.id, marketId, initialSelectedSlot]);

    const handleImageChange = useCallback((imageUrl: string, file?: File) => {
        form.setValue("imageUrl", imageUrl);
        setImagePreview(imageUrl);
        // Se for uma URL blob (arquivo novo), armazenar o arquivo para upload posterior
        if (file && imageUrl.startsWith("blob:")) {
            setUploadedImageFile(file);
        } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            // Se for uma URL HTTP/HTTPS, significa que já está salva no servidor
            setUploadedImageFile(null);
        } else {
            setUploadedImageFile(null);
        }
    }, [form]);

    const checkSlotConflict = (
        slot: number,
        startDate: Date,
        endDate: Date | null,
        excludeId?: string
    ): boolean => {
        const conflictingCampaign = campaigns.find(
            (c) =>
                c.slot === slot &&
                c.id !== excludeId &&
                (c.status === "ACTIVE" || c.status === "SCHEDULED")
        );

        if (!conflictingCampaign) return false;

        const conflictStart = new Date(conflictingCampaign.startDate);
        const conflictEnd = conflictingCampaign.endDate
            ? new Date(conflictingCampaign.endDate)
            : null;

        // Verifica se há sobreposição de datas
        if (endDate) {
            return (
                (startDate >= conflictStart && startDate <= (conflictEnd || new Date())) ||
                (endDate >= conflictStart && endDate <= (conflictEnd || new Date())) ||
                (startDate <= conflictStart && endDate >= (conflictEnd || new Date()))
            );
        } else {
            // Se não tem data de fim, verifica se começa antes do fim do conflito
            return startDate <= (conflictEnd || new Date());
        }
    };

    const onSubmit = (values: FormValues) => {
        if (!values.slot) {
            form.setError("slot", { message: "Slot é obrigatório" });
            return;
        }

        const startDate = new Date(values.startDate);
        const endDate = values.endDate ? new Date(values.endDate) : null;

        // Validação de datas
        if (endDate && endDate <= startDate) {
            form.setError("endDate", {
                message: "Data de fim deve ser posterior à data de início",
            });
            return;
        }

        // Validação: máximo de 1 semana (7 dias) entre início e fim
        if (endDate) {
            const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDifference > 7) {
                form.setError("endDate", {
                    message: "O período da campanha não pode exceder 7 dias (1 semana)",
                });
                toast.error("O período da campanha não pode exceder 7 dias (1 semana)");
                return;
            }
        }

        // Verifica conflito de slot (slots são globais - verificar TODAS as campanhas)
        if (!campaign) {
            // Verifica sobreposição de datas com outras campanhas no mesmo slot (de QUALQUER mercado)
            if (
                checkSlotConflict(
                    values.slot,
                    startDate,
                    endDate,
                    undefined
                )
            ) {
                const conflictingCampaign = campaigns.find(
                    (c) =>
                        c.slot === values.slot &&
                        (c.status === "ACTIVE" || c.status === "SCHEDULED" || c.status === "DRAFT") &&
                        c.marketId !== marketId // Pode ter conflito com outro mercado
                );
                
                if (conflictingCampaign && conflictingCampaign.marketId !== marketId) {
                    form.setError("slot", {
                        message: `Slot ${values.slot} já está ocupado por outro mercado neste período`,
                    });
                    toast.error(
                        `Slot ${values.slot} já está ocupado por outro mercado neste período. Escolha outro período ou slot.`
                    );
                } else {
                    form.setError("slot", {
                        message: `Slot ${values.slot} já está ocupado ou agendado neste período`,
                    });
                    toast.error(
                        `Slot ${values.slot} já está ocupado ou agendado neste período`
                    );
                }
                return;
            }
        } else {
            // Ao editar, verifica conflito excluindo a própria campanha
            if (
                checkSlotConflict(
                    values.slot,
                    startDate,
                    endDate,
                    campaign.id
                )
            ) {
                const conflictingCampaign = campaigns.find(
                    (c) =>
                        c.slot === values.slot &&
                        c.id !== campaign.id &&
                        (c.status === "ACTIVE" || c.status === "SCHEDULED" || c.status === "DRAFT") &&
                        c.marketId !== marketId // Pode ter conflito com outro mercado
                );
                
                if (conflictingCampaign && conflictingCampaign.marketId !== marketId) {
                    form.setError("slot", {
                        message: `Slot ${values.slot} já está ocupado por outro mercado neste período`,
                    });
                    toast.error(
                        `Slot ${values.slot} já está ocupado por outro mercado neste período. Escolha outro período ou slot.`
                    );
                } else {
                    form.setError("slot", {
                        message: `Slot ${values.slot} já está ocupado ou agendado neste período`,
                    });
                    toast.error(
                        `Slot ${values.slot} já está ocupado ou agendado neste período`
                    );
                }
                return;
            }
        }

        startTransition(async () => {
            try {
                let finalImageUrl = values.imageUrl;

                // Se houver um arquivo novo para upload (blob URL), fazer upload primeiro
                if (uploadedImageFile) {
                    try {
                        const uploadResult = await uploadFile({
                            file: uploadedImageFile,
                            folder: "campaigns",
                            access: "public",
                        });
                        finalImageUrl = uploadResult.url;
                    } catch (uploadError) {
                        const message =
                            uploadError instanceof Error
                                ? uploadError.message
                                : "Erro ao fazer upload da imagem";
                        toast.error(message);
                        form.setError("root", { message });
                        return;
                    }
                }

                // Validação: garantir que há uma URL de imagem
                if (!finalImageUrl || finalImageUrl.trim() === "") {
                    form.setError("imageUrl", {
                        message: "Imagem é obrigatória",
                    });
                    toast.error("Por favor, selecione uma imagem");
                    return;
                }

                // TypeScript: já validado que slot não é undefined acima
                if (!values.slot) {
                    form.setError("slot", { message: "Slot é obrigatório" });
                    return;
                }

                const campaignData: CampaignDTO = {
                    marketId: values.marketId,
                    title: values.title,
                    imageUrl: finalImageUrl,
                    slot: values.slot,
                    startDate: startDate,
                    endDate: endDate,
                    status: values.status,
                };

                if (campaign) {
                    await updateCampaign(campaign.id, campaignData as CampaignUpdateDTO);
                    toast.success("Campanha atualizada com sucesso");
                } else {
                    await createCampaign(campaignData);
                    toast.success("Campanha criada com sucesso");
                }
                onSuccess?.();
                onOpenChange(false);
                router.refresh();
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro ao salvar campanha";
                toast.error(message);
                form.setError("root", { message });
            }
        });
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {campaign ? "Editar Campanha" : "Nova Campanha"}
                    </DialogTitle>
                    <DialogDescription>
                        {campaign
                            ? "Atualize as informações da campanha promocional"
                            : "Preencha os dados para criar uma nova campanha promocional"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Promoção de Verão"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slot"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slot (Posição) *</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(Number(value))
                                            }
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o slot" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 8 }, (_, i) => i + 1).map(
                                                    (slot) => {
                                                        const occupied = campaigns.some(
                                                            (c) =>
                                                                c.slot === slot &&
                                                                c.id !== campaign?.id &&
                                                                (c.status === "ACTIVE" ||
                                                                    c.status === "SCHEDULED")
                                                        );
                                                        return (
                                                            <SelectItem
                                                                key={slot}
                                                                value={slot.toString()}
                                                                disabled={occupied}
                                                            >
                                                                Slot {slot}
                                                                {occupied && " (Ocupado)"}
                                                            </SelectItem>
                                                        );
                                                    }
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagem *</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            <SingleImageUploader
                                                onImageChange={handleImageChange}
                                            />
                                            {imagePreview && (
                                                <div className="relative w-full h-48 rounded-lg border overflow-hidden">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <Input
                                                {...field}
                                                type="hidden"
                                                value={field.value || ""}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Início *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Fim (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value || undefined);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Rascunho</SelectItem>
                                            <SelectItem value="SCHEDULED">Agendada</SelectItem>
                                            <SelectItem value="ACTIVE">Ativa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <div className="text-sm text-destructive">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {campaign ? "Atualizar" : "Criar"} Campanha
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

