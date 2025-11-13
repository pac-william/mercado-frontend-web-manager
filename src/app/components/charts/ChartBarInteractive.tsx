"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Gráfico de barras interativo de faturamento e ticket médio diário"

type DailyRevenueData = {
    date: string;
    faturamento: number;
    ticketMedio: number;
}

const chartConfig = {
    receita: {
        label: "Receita",
    },
    faturamento: {
        label: "Faturamento",
        color: "hsl(222 81% 60%)",
    },
    ticketMedio: {
        label: "Ticket Médio",
        color: "hsl(152 65% 45%)",
    },
} satisfies ChartConfig

type ChartBarInteractiveProps = {
    data?: DailyRevenueData[];
    title?: string;
    subtitle?: string;
}

export function ChartBarInteractive({ 
    data = [], 
    title = "Evolução Diária",
    subtitle = "Faturamento e Ticket Médio"
}: ChartBarInteractiveProps) {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("faturamento")

    const total = React.useMemo(
        () => ({
            faturamento: data.reduce((acc, curr) => acc + curr.faturamento, 0),
            ticketMedio: data.length > 0 
                ? data.reduce((acc, curr) => acc + curr.ticketMedio, 0) / data.length 
                : 0,
        }),
        [data]
    )

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {subtitle}
                    </CardDescription>
                </div>
                <div className="flex">
                    {["faturamento", "ticketMedio"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        const value = total[key as keyof typeof total]
                        const formattedValue = key === "faturamento"
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(value)
                            : new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(value)
                        
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-muted-foreground text-xs">
                                    {chartConfig[chart].label}
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {formattedValue}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("pt-BR", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            width={80}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(value)
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="receita"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("pt-BR", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                    formatter={(value) => {
                                        const numericValue = typeof value === "number" ? value : Number(value)
                                        if (Number.isNaN(numericValue)) return value
                                        return new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(numericValue)
                                    }}
                                />
                            }
                        />
                        <Bar 
                            dataKey={activeChart} 
                            fill={`var(--color-${activeChart})`}
                            radius={4}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
