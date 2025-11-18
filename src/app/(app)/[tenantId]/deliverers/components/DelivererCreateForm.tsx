"use client"

import { createDeliverer, getDelivererById, updateDeliverer } from "@/actions/deliverer.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DelivererDTO } from "@/dtos/delivererDTO";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface DelivererCreateFormProps {
    tenantId: string;
    delivererId?: string;
}

export const DelivererCreateForm = ({ tenantId, delivererId }: DelivererCreateFormProps) => {
    const { navigate } = useNavigationWithLoading();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = Boolean(delivererId);

    const form = useForm<z.infer<typeof DelivererDTO>>({
        resolver: zodResolver(DelivererDTO),
        defaultValues: {
            status: "ACTIVE",
            vehicle: {
                type: "bicicleta",
            },
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (delivererId) {
            setIsLoading(true);
            getDelivererById(delivererId)
                .then((delivererData) => {
                    form.reset({
                        name: delivererData.name,
                        document: delivererData.document,
                        phone: delivererData.phone,
                        status: delivererData.status,
                        vehicle: {
                            type: delivererData.vehicle.type as "bicicleta" | "moto" | "carro",
                            plate: delivererData.vehicle.plate || undefined,
                            description: delivererData.vehicle.description || undefined,
                        },
                    });
                })
                .catch((error) => {
                    toast.error("Erro ao carregar entregador");
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [delivererId, form]);

    async function onSubmit(values: z.infer<typeof DelivererDTO>) {
        if (isSubmitting) return;

        if (!values.name || !values.name.trim()) {
            toast.error("Nome do entregador é obrigatório");
            return;
        }

        if (!values.document || !values.document.trim()) {
            toast.error("Documento é obrigatório");
            return;
        }

        if (!values.phone || !values.phone.trim()) {
            toast.error("Telefone é obrigatório");
            return;
        }

        setIsSubmitting(true);

        const delivererData: DelivererDTO = {
            name: values.name.trim(),
            document: values.document.trim(),
            phone: values.phone.trim(),
            status: values.status,
            vehicle: {
                type: values.vehicle.type,
                plate: values.vehicle.plate?.trim() || undefined,
                description: values.vehicle.description?.trim() || undefined,
            },
        };

        try {
            if (isEditing && delivererId) {
                await updateDeliverer(delivererId, delivererData);
                toast.success("Entregador atualizado com sucesso");
            } else {
                await createDeliverer(delivererData);
                toast.success("Entregador cadastrado com sucesso");
            }
            navigate(`/${tenantId}/deliverers`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : isEditing ? "Erro ao atualizar entregador" : "Erro ao cadastrar entregador";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
                    <p className="text-muted-foreground">Carregando entregador...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Entregador" : "Cadastro de Entregador"}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Entregador</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o nome do entregador" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="document"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Documento (CPF/CNH)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o documento" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o telefone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="vehicle.type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Veículo</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="bicicleta">Bicicleta</SelectItem>
                                                <SelectItem value="moto">Moto</SelectItem>
                                                <SelectItem value="carro">Carro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicle.plate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Placa (opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite a placa" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="vehicle.description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição do Veículo (opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Moto vermelha, Carro branco" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Entregador ativo
                                        </FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            {field.value === "ACTIVE" ? "Entregador disponível para entregas" : "Entregador inativo"}
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value === "ACTIVE"}
                                            onCheckedChange={(checked) => field.onChange(checked ? "ACTIVE" : "INACTIVE")}
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
                                {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

