"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Comparativo de faturamento por canal"

const chartData = [
  { month: "Mar", delivery: 46800, pickup: 18200 },
  { month: "Abr", delivery: 49250, pickup: 20340 },
  { month: "Mai", delivery: 47680, pickup: 18850 },
  { month: "Jun", delivery: 52120, pickup: 21400 },
  { month: "Jul", delivery: 54480, pickup: 23210 },
]

const chartConfig = {
  delivery: {
    label: "Entregas",
    color: "hsl(222 81% 45%)",
  },
  pickup: {
    label: "Retiradas",
    color: "hsl(142 70% 45%)",
  },
} satisfies ChartConfig

export function ChartBarMultiple() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Faturamento por canal</CardTitle>
        <CardDescription>Comparativo dos últimos 5 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              width={70}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value) => {
                    if (typeof value !== "number") {
                      const numericValue = Number(value)
                      if (Number.isNaN(numericValue)) return value
                      return `R$ ${numericValue.toLocaleString("pt-BR")}`
                    }
                    return `R$ ${value.toLocaleString("pt-BR")}`
                  }}
                />
              }
            />
            <Bar dataKey="delivery" radius={4} fill="var(--color-delivery)" />
            <Bar dataKey="pickup" radius={4} fill="var(--color-pickup)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Crescimento médio de 7,4% em entregas <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Dados consolidados de março a julho de 2024
        </div>
      </CardFooter>
    </Card>
  )
}
