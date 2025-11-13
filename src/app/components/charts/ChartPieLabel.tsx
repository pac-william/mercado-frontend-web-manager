"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

export const description = "Distribuição de pedidos por status"

const chartData = [
  { status: "Entregues", pedidos: 186, fill: "var(--color-Entregues)" },
  { status: "Preparando", pedidos: 44, fill: "var(--color-Preparando)" },
  { status: "Confirmados", pedidos: 28, fill: "var(--color-Confirmados)" },
  { status: "Pendentes", pedidos: 19, fill: "var(--color-Pendentes)" },
  { status: "Cancelados", pedidos: 13, fill: "var(--color-Cancelados)" },
]

const chartConfig = {
  pedidos: {
    label: "Pedidos",
  },
  Entregues: {
    label: "Entregues",
    color: "hsl(152 65% 45%)",
  },
  Preparando: {
    label: "Preparando",
    color: "hsl(222 81% 60%)",
  },
  Confirmados: {
    label: "Confirmados",
    color: "hsl(47 95% 57%)",
  },
  Pendentes: {
    label: "Pendentes",
    color: "hsl(20 90% 55%)",
  },
  Cancelados: {
    label: "Cancelados",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig

export function ChartPieLabel() {
  return (
    <Card className="flex flex-col flex-1 h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status dos pedidos</CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[260px] pb-0"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) =>
                    typeof value === "number"
                      ? `${value} pedidos`
                      : value
                  }
                />
              }
            />
            <Pie data={chartData} dataKey="pedidos" label nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          78% das entregas concluídas no prazo <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Pedidos em preparação cresceram 12% na semana
        </div>
      </CardFooter>
    </Card>
  )
}
