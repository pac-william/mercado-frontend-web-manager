"use client"

import { TrendingUp } from "lucide-react"
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

export const description = "Evolução do ticket médio semanal"

type WeeklyTicketPoint = { semana: string; ticket: number }

const defaultChartData: WeeklyTicketPoint[] = [
  { semana: "10-16 Jun", ticket: 68.4 },
  { semana: "17-23 Jun", ticket: 71.2 },
  { semana: "24-30 Jun", ticket: 73.9 },
  { semana: "01-07 Jul", ticket: 76.5 },
  { semana: "08-14 Jul", ticket: 74.1 },
  { semana: "15-21 Jul", ticket: 79.3 },
]

const chartConfig = {
  ticket: {
    label: "Ticket médio",
    color: "hsl(222 81% 60%)",
  },
} satisfies ChartConfig

export function ChartAreaDefault({ data, title = "Ticket médio semanal", subtitle = "Últimas 6 semanas" }: { data?: WeeklyTicketPoint[]; title?: string; subtitle?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data && data.length > 0 ? data : defaultChartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="semana"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              width={70}
              tickFormatter={(value) =>
                `R$ ${value.toLocaleString("pt-BR", {
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
                    const numericValue =
                      typeof value === "number" ? value : Number(value)
                    if (Number.isNaN(numericValue)) return value
                    return `R$ ${numericValue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  }}
                />
              }
            />
            <Area
              dataKey="ticket"
              type="monotone"
              fill="var(--color-ticket)"
              fillOpacity={0.2}
              stroke="var(--color-ticket)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Ticket médio 9% acima da meta <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Semana de 15 a 21 de julho liderou com R$ 79,30
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
