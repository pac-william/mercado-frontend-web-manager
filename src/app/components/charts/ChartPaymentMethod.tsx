"use client"

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

type PaymentPoint = { method: string; value: number }

const chartConfig = {
  value: {
    label: "Faturamento",
    color: "hsl(222 81% 45%)",
  },
} satisfies ChartConfig

export function ChartPaymentMethod({ data, title = "Faturamento por método de pagamento", subtitle = "Pedidos entregues" }: { data: PaymentPoint[]; title?: string; subtitle?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="method"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              width={70}
              tickFormatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value)
                    if (Number.isNaN(n)) return value
                    return `R$ ${n.toLocaleString("pt-BR")}`
                  }}
                />
              }
            />
            <Bar dataKey="value" radius={4} fill="var(--color-value)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Considera somente pedidos com status entregue
        </div>
      </CardFooter>
    </Card>
  )
}


