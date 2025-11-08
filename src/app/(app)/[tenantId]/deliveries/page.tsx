import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function DeliveriesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Entrega</h1>
                <p className="text-muted-foreground">
                    Gerencie os pedidos e entregas do seu mercado
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Pedidos e Entregas
                    </CardTitle>
                    <CardDescription>
                        Visualize e gerencie todos os pedidos pendentes de entrega
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

