import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus } from "lucide-react";

export default function DeliverersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entregadores</h1>
                    <p className="text-muted-foreground">
                        Gerencie os entregadores cadastrados no seu mercado
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Entregador
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Lista de Entregadores
                    </CardTitle>
                    <CardDescription>
                        Visualize e gerencie os entregadores disponíveis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Esta página será implementada em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

