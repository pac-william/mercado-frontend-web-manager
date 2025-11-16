"use client"

import { getDeliverySettingsByMarketId, upsertDeliverySettings } from "@/actions/deliverySettings.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DeliverySettingsDTO } from "@/dtos/deliverySettingsDTO";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface DeliverySettingsFormProps {
    tenantId: string;
}

export const DeliverySettingsForm = ({ tenantId }: DeliverySettingsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.input<typeof DeliverySettingsDTO>>({
        resolver: zodResolver(DeliverySettingsDTO),
        defaultValues: {
            marketId: tenantId,
            deliveryRadius: 5.0,
            deliveryFee: 5.0,
            allowsPickup: true,
        },
        mode: "onChange",
    });

    useEffect(() => {
        form.setValue("marketId", tenantId);
    }, [tenantId, form]);

    useEffect(() => {
        setIsLoading(true);
        getDeliverySettingsByMarketId(tenantId)
            .then((settings) => {
                if (settings) {
                    form.reset({
                        marketId: tenantId,
                        deliveryRadius: settings.deliveryRadius,
                        deliveryFee: settings.deliveryFee,
                        allowsPickup: settings.allowsPickup,
                    });
                }
            })
            .catch((error) => {
                console.error("Erro ao carregar configurações:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [tenantId, form]);

    async function onSubmit(values: z.input<typeof DeliverySettingsDTO>) {
        if (isSubmitting) return;

        if (!values.deliveryRadius || values.deliveryRadius < 0) {
            toast.error("Raio de entrega deve ser maior ou igual a zero");
            return;
        }

        if (!values.deliveryFee || values.deliveryFee < 0) {
            toast.error("Valor da entrega deve ser maior ou igual a zero");
            return;
        }

        setIsSubmitting(true);

        const settingsData: DeliverySettingsDTO = {
            marketId: tenantId,
            deliveryRadius: Number(values.deliveryRadius),
            deliveryFee: Number(values.deliveryFee),
            allowsPickup: values.allowsPickup ?? true,
        };

        try {
            await upsertDeliverySettings(settingsData);
            toast.success("Configurações de entrega salvas com sucesso");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao salvar configurações de entrega";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <Card className="flex flex-col flex-1 w-full">
                <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
                    <p className="text-muted-foreground">Carregando configurações...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col flex-1 w-full">
            <CardHeader>
                <CardTitle>Configurações de Entrega</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormField
                            control={form.control}
                            name="deliveryRadius"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Raio de Distância (km)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            placeholder="Ex: 5.0"
                                            value={field.value && !Number.isNaN(field.value) ? field.value : ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (!value) {
                                                    field.onChange(0);
                                                } else {
                                                    field.onChange(parseFloat(value));
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Distância máxima em quilômetros para realizar entregas
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="deliveryFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor da Entrega (R$)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Ex: 5.00"
                                            value={field.value && !Number.isNaN(field.value) ? field.value : ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (!value) {
                                                    field.onChange(0);
                                                } else {
                                                    field.onChange(parseFloat(value));
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Valor cobrado por entrega
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="allowsPickup"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Permitir Retirada
                                        </FormLabel>
                                        <FormDescription>
                                            Clientes podem retirar pedidos no mercado
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? true}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                className="min-w-[120px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Salvando..." : "Salvar Configurações"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

