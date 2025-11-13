"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

type RevenuePoint = { date: string; revenue: number }

const chartConfig = {
  revenue: {
    label: "Faturamento",
    color: "hsl(152 65% 45%)",
  },
} satisfies ChartConfig

export function ChartRevenueDaily({ data, title = "Faturamento diário", subtitle = "Últimos 30 dias" }: { data: RevenuePoint[]; title?: string; subtitle?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              width={70}
              tickFormatter={(value) =>
                `R$ ${Number(value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}`
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value)
                    if (Number.isNaN(n)) return value
                    return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-sm">
          Inclui somente pedidos entregues
        </div>
      </CardFooter>
    </Card>
  )
}


