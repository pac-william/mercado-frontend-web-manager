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

type TopProductPoint = { name: string; quantity: number }

const chartConfig = {
  quantity: {
    label: "Unidades vendidas",
    color: "hsl(222 81% 60%)",
  },
} satisfies ChartConfig

export function ChartTopProducts({ data, title = "Top produtos", subtitle = "Mais vendidos" }: { data: TopProductPoint[]; title?: string; subtitle?: string }) {
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
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis width={50} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => `${value} un.`}
                />
              }
            />
            <Bar dataKey="quantity" radius={4} fill="var(--color-quantity)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Considera todos os pedidos entregues
        </div>
      </CardFooter>
    </Card>
  )
}


