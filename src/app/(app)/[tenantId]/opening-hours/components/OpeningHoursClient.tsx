"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Clock, Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getOpeningHours, saveOpeningHours, type OpeningHoursDay } from "@/actions/opening-hours.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const dayNames = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
]

const openingHoursSchema = z.object({
    days: z.array(
        z.object({
            dayOfWeek: z.number(),
            isOpen: z.boolean(),
            openTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (use HH:mm)"),
            closeTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (use HH:mm)"),
        })
    ).length(7),
}).refine(
    (data) => {
        return data.days.every((day) => {
            if (!day.isOpen) return true;
            return day.openTime < day.closeTime;
        });
    },
    {
        message: "O horário de abertura deve ser anterior ao horário de fechamento",
        path: ["days"],
    }
);

type OpeningHoursFormValues = z.infer<typeof openingHoursSchema>

interface OpeningHoursClientProps {
    marketId: string;
}

export function OpeningHoursClient({ marketId }: OpeningHoursClientProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<OpeningHoursFormValues>({
        resolver: zodResolver(openingHoursSchema),
        defaultValues: {
            days: [
                { dayOfWeek: 0, isOpen: false, openTime: "08:00", closeTime: "18:00" },
                { dayOfWeek: 1, isOpen: true, openTime: "08:00", closeTime: "18:00" },
                { dayOfWeek: 2, isOpen: true, openTime: "08:00", closeTime: "18:00" },
                { dayOfWeek: 3, isOpen: true, openTime: "08:00", closeTime: "18:00" },
                { dayOfWeek: 4, isOpen: true, openTime: "08:00", closeTime: "18:00" },
                { dayOfWeek: 5, isOpen: true, openTime: "08:00", closeTime: "18:00" },
                { dayOfWeek: 6, isOpen: true, openTime: "08:00", closeTime: "18:00" },
            ],
        },
    })

    useEffect(() => {
        const loadOpeningHours = async () => {
            setIsLoading(true)
            try {
                const data = await getOpeningHours(marketId)
                form.reset({
                    days: data.days.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
                })
            } catch (error) {
                console.error("Erro ao carregar horários:", error)
                toast.error("Erro ao carregar horários de funcionamento")
            } finally {
                setIsLoading(false)
            }
        }

        loadOpeningHours()
    }, [marketId, form])

    const onSubmit = async (values: OpeningHoursFormValues) => {
        if (isSaving) return

        setIsSaving(true)
        try {
            await saveOpeningHours(marketId, values.days)
            toast.success("Horários de funcionamento salvos com sucesso")
        } catch (error) {
            console.error("Erro ao salvar horários:", error)
            const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar os horários de funcionamento."
            toast.error(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Configuração de Horários
                        </CardTitle>
                        <CardDescription>
                            Defina os dias da semana e horários em que o mercado estará aberto
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {dayNames.map((dayName, index) => {
                            const day = form.watch(`days.${index}`)
                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <FormField
                                                control={form.control}
                                                name={`days.${index}.isOpen`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2">
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="!mt-0 font-medium min-w-[140px]">
                                                            {dayName}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />

                                            {day?.isOpen && (
                                                <>
                                                    <FormField
                                                        control={form.control}
                                                        name={`days.${index}.openTime`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel className="sr-only">Abertura</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        {...field}
                                                                        className="w-full"
                                                                        disabled={!day?.isOpen}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <span className="text-muted-foreground">até</span>

                                                    <FormField
                                                        control={form.control}
                                                        name={`days.${index}.closeTime`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel className="sr-only">Fechamento</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        {...field}
                                                                        className="w-full"
                                                                        disabled={!day?.isOpen}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            )}

                                            {!day?.isOpen && (
                                                <span className="text-muted-foreground text-sm flex-1">
                                                    Fechado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {index < dayNames.length - 1 && <Separator className="mt-4" />}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Horários
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

