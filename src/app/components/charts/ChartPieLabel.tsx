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

type StatusPoint = { status: string; pedidos: number; fill?: string }

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

export function ChartPieLabel({ data, title = "Status dos pedidos", subtitle = "Últimos 30 dias" }: { data: StatusPoint[]; title?: string; subtitle?: string }) {
  return (
    <Card className="flex flex-col flex-1 h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
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
            <Pie 
              data={data.map(d => ({ 
                fill: d.fill || `var(--color-${d.status})`, 
                status: d.status, 
                pedidos: d.pedidos 
              }))} 
              dataKey="pedidos" 
              label 
              nameKey="status"
            />
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
